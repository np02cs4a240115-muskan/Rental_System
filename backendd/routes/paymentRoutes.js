// routes/paymentRoutes.js
'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const router  = express.Router();

const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

// POST /api/payments
router.post(
  '/',
  [
    body('booking_id').isInt({ min: 1 }).withMessage('Valid booking_id is required'),
    body('payment_method')
      .optional()
      .isIn(['cash', 'card', 'online'])
      .withMessage('payment_method must be cash, card, or online'),
  ],
  validate,
  paymentController.createPayment
);

// GET /api/payments/booking/:bookingId
router.get(
  '/booking/:bookingId',
  [param('bookingId').isInt({ min: 1 }).withMessage('Valid bookingId required')],
  validate,
  paymentController.getPaymentByBooking
);

// PATCH /api/payments/:id/status  – admin only
router.patch(
  '/:id/status',
  restrictTo('admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('Valid payment id required'),
    body('payment_status').notEmpty().withMessage('payment_status is required'),
  ],
  validate,
  paymentController.updatePaymentStatus
);

module.exports = router;
