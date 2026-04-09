// routes/bookingRoutes.js

const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const bookingController       = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/auth');
const validate                = require('../middleware/validate');

// All booking routes require authentication
router.use(protect);

// GET  /api/bookings/my    – current user's bookings
router.get('/my', bookingController.getMyBookings);

// GET  /api/bookings       – admin: all bookings
router.get('/', restrictTo('admin'), bookingController.getAllBookings);

// POST /api/bookings       – create a booking
router.post(
  '/',
  [
    body('car_id').isInt({ min: 1 }).withMessage('Valid car ID is required'),
    body('start_date')
      .isDate()
      .withMessage('start_date must be a valid date (YYYY-MM-DD)'),
    body('end_date')
      .isDate()
      .withMessage('end_date must be a valid date (YYYY-MM-DD)')
      .custom((end, { req }) => {
        if (new Date(end) <= new Date(req.body.start_date)) {
          throw new Error('end_date must be after start_date');
        }
        return true;
      }),
  ],
  validate,
  bookingController.createBooking
);

// GET    /api/bookings/:id         – single booking (owner or admin)
router.get('/:id', bookingController.getBooking);

// PATCH  /api/bookings/:id/cancel  – cancel booking (owner or admin)
router.patch('/:id/cancel', bookingController.cancelBooking);

// PATCH  /api/bookings/:id/status  – admin: update status freely
router.patch(
  '/:id/status',
  restrictTo('admin'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Invalid status value'),
  ],
  validate,
  bookingController.updateBookingStatus
);

module.exports = router;
