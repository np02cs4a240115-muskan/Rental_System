// controllers/esewaController.js
'use strict';

const crypto  = require('crypto');
const axios   = require('axios');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const db      = require('../config/db');

// ── eSewa config (sandbox by default) ────────────────────────────────────────
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'; // sandbox secret
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';      // sandbox product code
const ESEWA_VERIFY_URL   = process.env.ESEWA_VERIFY_URL  || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';
const FRONTEND_URL       = process.env.FRONTEND_URL      || 'http://localhost:3000';

// ── Generate HMAC-SHA256 signature ────────────────────────────────────────────
function generateSignature(message) {
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
}

// ── POST /api/esewa/initiate ──────────────────────────────────────────────────
// Returns the form fields the frontend needs to POST to eSewa
exports.initiatePayment = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    // 1. Load booking
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // 2. Ownership check
    if (req.user.role !== 'admin' && Number(booking.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // 3. Guard against paying cancelled/completed bookings
    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for a ${booking.status} booking`,
      });
    }

    // 4. Prevent duplicate payment
    const existing = await Payment.findByBookingId(booking_id);
    if (existing && existing.payment_status === 'completed') {
      return res.status(409).json({ success: false, message: 'Booking already paid' });
    }

    // 5. Build eSewa-required fields
    const amount        = Number(booking.total_price).toFixed(2);
    const taxAmount     = '0';
    const totalAmount   = amount;
    const transactionUuid = `booking-${booking_id}-${Date.now()}`;
    const productCode   = ESEWA_PRODUCT_CODE;
    const successUrl    = `${FRONTEND_URL}/payment/esewa/success`;
    const failureUrl    = `${FRONTEND_URL}/payment/esewa/failure`;

    // 6. Signature: "total_amount,transaction_uuid,product_code"
    const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = generateSignature(signatureMessage);

    // 7. Save / update payment record as pending
    if (!existing) {
      await Payment.create({
        booking_id,
        amount: booking.total_price,
        payment_method: 'esewa',
      });
    } else {
      // Update transaction_uuid so we can match on callback
      await db.execute(
        'UPDATE payments SET transaction_uuid = ?, payment_method = ? WHERE booking_id = ?',
        [transactionUuid, 'esewa', booking_id]
      );
    }

    // Store transaction_uuid for verification later
    await db.execute(
      'UPDATE payments SET transaction_uuid = ? WHERE booking_id = ?',
      [transactionUuid, booking_id]
    );

    res.json({
      success: true,
      esewa: {
        url: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form', // sandbox URL
        fields: {
          amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: productCode,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: successUrl,
          failure_url: failureUrl,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/esewa/verify ────────────────────────────────────────────────────
// Called by frontend after eSewa redirects to success_url with encoded data
exports.verifyPayment = async (req, res, next) => {
  try {
    const { data } = req.body; // base64-encoded JSON from eSewa

    if (!data) {
      return res.status(400).json({ success: false, message: 'No data received from eSewa' });
    }

    // 1. Decode base64 response
    let esewaResponse;
    try {
      esewaResponse = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid eSewa response data' });
    }

    const {
      transaction_uuid,
      total_amount,
      status,
      signed_field_names,
      signature: receivedSignature,
    } = esewaResponse;

    // 2. Verify signature
    const signatureMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const expectedSignature = generateSignature(signatureMessage);

    if (expectedSignature !== receivedSignature) {
      return res.status(400).json({ success: false, message: 'Signature mismatch — possible tampering' });
    }

    // 3. Check status from eSewa
    if (status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: `Payment not completed. Status: ${status}` });
    }

    // 4. Find payment by transaction_uuid
    const [rows] = await db.execute(
      'SELECT * FROM payments WHERE transaction_uuid = ? LIMIT 1',
      [transaction_uuid]
    );
    const payment = rows[0];

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.payment_status === 'completed') {
      return res.json({ success: true, message: 'Payment already verified', payment });
    }

    // 5. Double-check with eSewa's status API
    const verifyRes = await axios.get(ESEWA_VERIFY_URL, {
      params: {
        product_code: ESEWA_PRODUCT_CODE,
        total_amount,
        transaction_uuid,
      },
    });

    if (verifyRes.data?.status !== 'COMPLETE') {
      await Payment.updateStatus(payment.id, 'failed');
      return res.status(400).json({ success: false, message: 'eSewa verification failed' });
    }

    // 6. Mark payment as completed & booking as confirmed
    await Payment.updateStatus(payment.id, 'completed');
    await Booking.updateStatus(payment.booking_id, 'confirmed');

    const [updatedRows] = await db.execute('SELECT * FROM payments WHERE id = ?', [payment.id]);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed!',
      payment: updatedRows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/esewa/failure ───────────────────────────────────────────────────
exports.handleFailure = async (req, res, next) => {
  try {
    const { data } = req.body;
    if (data) {
      try {
        const decoded = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
        const { transaction_uuid } = decoded;
        if (transaction_uuid) {
          await db.execute(
            "UPDATE payments SET payment_status = 'failed' WHERE transaction_uuid = ?",
            [transaction_uuid]
          );
        }
      } catch (_) {}
    }
    res.json({ success: false, message: 'Payment failed or was cancelled by user' });
  } catch (err) {
    next(err);
  }
};
