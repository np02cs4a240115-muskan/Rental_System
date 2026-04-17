// routes/bookingRoutes.js
'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const router  = express.Router();

const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All booking routes require authentication
router.use(protect);

// POST /api/bookings
router.post(
  '/',
  [
    body('car_id').isInt({ min: 1 }).withMessage('Valid car_id is required'),
    body('start_date').isDate().withMessage('Valid start_date (YYYY-MM-DD) is required'),
    body('end_date').isDate().withMessage('Valid end_date (YYYY-MM-DD) is required'),
  ],
  validate,
  bookingController.createBooking
);

// GET /api/bookings/my  – logged-in user's bookings  (MUST be before /:id)
router.get('/my', bookingController.getMyBookings);

// GET /api/bookings  – admin only
router.get('/', restrictTo('admin'), bookingController.getAllBookings);

// GET /api/bookings/:id
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid booking id required')],
  validate,
  bookingController.getBooking
);

// PATCH /api/bookings/:id/cancel
router.patch(
  '/:id/cancel',
  [param('id').isInt({ min: 1 }).withMessage('Valid booking id required')],
  validate,
  bookingController.cancelBooking
);

// PATCH /api/bookings/:id/status  – admin only
router.patch(
  '/:id/status',
  restrictTo('admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('Valid booking id required'),
    body('status').notEmpty().withMessage('Status is required'),
  ],
  validate,
  bookingController.updateBookingStatus
);

module.exports = router;
