'use strict';

const Booking = require('../models/Booking');
const Car = require('../models/Car');

const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const isOwnerOrAdmin = (user, ownerId) =>
  user.role === 'admin' || Number(ownerId) === Number(user.id);

exports.createBooking = async (req, res, next) => {
  try {
    const { car_id, start_date, end_date } = req.body;
    const user_id = req.user.id;

    const car = await Car.findById(car_id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    if (!car.availability) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for booking',
      });
    }

    const alreadyBooked = await Booking.isCarBooked(car_id, start_date, end_date);
    if (alreadyBooked) {
      return res.status(409).json({
        success: false,
        message: 'Car is already booked for the selected dates',
      });
    }

    let total_price;
    try {
      total_price = Booking.calcTotalPrice(start_date, end_date, car.price_per_day);
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const bookingId = await Booking.create({
      user_id,
      car_id,
      start_date,
      end_date,
      total_price,
    });

    const booking = await Booking.findById(bookingId);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findByUser(req.user.id);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll();
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!isOwnerOrAdmin(req.user, booking.user_id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!isOwnerOrAdmin(req.user, booking.user_id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`,
      });
    }

    await Booking.updateStatus(req.params.id, 'cancelled');
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${BOOKING_STATUSES.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await Booking.updateStatus(req.params.id, status);
    res.json({ success: true, message: `Booking status updated to '${status}'` });
  } catch (error) {
    next(error);
  }
};
