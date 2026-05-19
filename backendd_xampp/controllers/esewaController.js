'use strict';

const crypto = require('crypto');
const axios = require('axios');

const db = require('../config/db');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
const ESEWA_VERIFY_URL =
  process.env.ESEWA_VERIFY_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const isOwnerOrAdmin = (user, ownerId) =>
  user.role === 'admin' || Number(ownerId) === Number(user.id);

const generateSignature = (message) =>
  crypto.createHmac('sha256', ESEWA_SECRET_KEY).update(message).digest('base64');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!isOwnerOrAdmin(req.user, booking.user_id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot pay for a ${booking.status} booking`,
      });
    }

    const existingPayment = await Payment.findByBookingId(booking_id);
    if (existingPayment && existingPayment.payment_status === 'completed') {
      return res.status(409).json({ success: false, message: 'Booking already paid' });
    }

    const amount = Number(booking.total_price).toFixed(2);
    const transactionUuid = `booking-${booking_id}-${Date.now()}`;
    const signatureMessage =
      `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`;

    if (!existingPayment) {
      await Payment.create({
        booking_id,
        amount: booking.total_price,
        payment_method: 'esewa',
      });
    } else {
      await db.execute(
        'UPDATE payments SET transaction_uuid = ?, payment_method = ? WHERE booking_id = ?',
        [transactionUuid, 'esewa', booking_id]
      );
    }

    await db.execute(
      'UPDATE payments SET transaction_uuid = ? WHERE booking_id = ?',
      [transactionUuid, booking_id]
    );

    res.json({
      success: true,
      esewa: {
        url: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        fields: {
          amount,
          tax_amount: '0',
          total_amount: amount,
          transaction_uuid: transactionUuid,
          product_code: ESEWA_PRODUCT_CODE,
          product_service_charge: '0',
          product_delivery_charge: '0',
          success_url: `${FRONTEND_URL}/payment/esewa/success`,
          failure_url: `${FRONTEND_URL}/payment/esewa/failure`,
          signed_field_names: 'total_amount,transaction_uuid,product_code',
          signature: generateSignature(signatureMessage),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: 'No data received from eSewa' });
    }

    let esewaResponse;
    try {
      esewaResponse = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid eSewa response data' });
    }

    const {
      transaction_uuid,
      total_amount,
      status,
      signature: receivedSignature,
    } = esewaResponse;

    const signatureMessage =
      `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const expectedSignature = generateSignature(signatureMessage);

    if (expectedSignature !== receivedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Signature mismatch - possible tampering',
      });
    }

    if (status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: `Payment not completed. Status: ${status}` });
    }

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

    const verificationResponse = await axios.get(ESEWA_VERIFY_URL, {
      params: {
        product_code: ESEWA_PRODUCT_CODE,
        total_amount,
        transaction_uuid,
      },
    });

    if (verificationResponse.data?.status !== 'COMPLETE') {
      await Payment.updateStatus(payment.id, 'failed');
      return res.status(400).json({ success: false, message: 'eSewa verification failed' });
    }

    await Payment.updateStatus(payment.id, 'completed');
    await Booking.updateStatus(payment.booking_id, 'confirmed');

    const [updatedRows] = await db.execute('SELECT * FROM payments WHERE id = ?', [payment.id]);

    res.json({
      success: true,
      message: 'Payment verified and booking confirmed!',
      payment: updatedRows[0],
    });
  } catch (error) {
    next(error);
  }
};

exports.handleFailure = async (req, res, next) => {
  try {
    const { data } = req.body;

    if (data) {
      try {
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
        const { transaction_uuid } = decodedData;

        if (transaction_uuid) {
          await db.execute(
            "UPDATE payments SET payment_status = 'failed' WHERE transaction_uuid = ?",
            [transaction_uuid]
          );
        }
      } catch (error) {
      }
    }

    res.json({ success: false, message: 'Payment failed or was cancelled by user' });
  } catch (error) {
    next(error);
  }
};
