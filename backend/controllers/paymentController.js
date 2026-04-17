const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

exports.createPayment = async (req, res, next) => {
  try {
    const { booking_id, payment_method } = req.body;

    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && Number(booking.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot create payment for a ${booking.status} booking`,
      });
    }

    const existing = await Payment.findByBookingId(booking_id);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A payment record already exists for this booking',
      });
    }

    const paymentId = await Payment.create({
      booking_id,
      amount: booking.total_price,
      payment_method: payment_method || 'cash',
    });

    const payment = await Payment.findById(paymentId);
    res.status(201).json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && Number(booking.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payment = await Payment.findByBookingId(req.params.bookingId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment found for this booking' });
    }

    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { payment_status } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (!validStatuses.includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    await Payment.updateStatus(req.params.id, payment_status);

    if (payment_status === 'completed') {
      await Booking.updateStatus(payment.booking_id, 'confirmed');
    }

    res.json({
      success: true,
      message: `Payment status updated to '${payment_status}'`,
    });
  } catch (err) {
    next(err);
  }
};