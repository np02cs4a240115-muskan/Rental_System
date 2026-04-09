// routes/paymentRoutes.js

const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const paymentController       = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');
const validate                = require('../middleware/validate');

// All payment routes require authentication
router.use(protect);

// POST /api/payments  – create a payment for a booking
router.post(
  '/',
  [
    body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID is required'),
    body('payment_method')
      .optional()
      .isIn(['cash', 'card', 'bank_transfer', 'online'])
      .withMessage('Invalid payment method'),
  ],
  validate,
  paymentController.createPayment
);

// GET  /api/payments/booking/:bookingId  – payment for a specific booking
router.get('/booking/:bookingId', paymentController.getPaymentByBooking);

// PATCH /api/payments/:id/status  – admin: update payment status
router.patch(
  '/:id/status',
  restrictTo('admin'),
  [
    body('payment_status')
      .isIn(['pending', 'completed', 'failed', 'refunded'])
      .withMessage('Invalid payment_status value'),
  ],
  validate,
  paymentController.updatePaymentStatus
);

module.exports = router;
