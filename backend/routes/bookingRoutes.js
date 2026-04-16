// routes/bookingRoutes.js
'use strict';

const express = require('express');
const { body } = require('express-validator');
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

// GET /api/bookings/my  – logged-in user's bookings
router.get('/my', bookingController.getMyBookings);

// GET /api/bookings  – admin only
router.get('/', restrictTo('admin'), bookingController.getAllBookings);

// GET /api/bookings/:id
router.get('/:id', bookingController.getBooking);

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', bookingController.cancelBooking);

// PATCH /api/bookings/:id/status  – admin only
router.patch(
  '/:id/status',
  restrictTo('admin'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  bookingController.updateBookingStatus
);

module.exports = router;
