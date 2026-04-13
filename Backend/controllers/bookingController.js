const Booking = require('../models/Booking');
const Car     = require('../models/Car');

exports.createBooking = async (req, res, next) => {
  try {
    const { car_id, start_date, end_date } = req.body;
    const user_id = req.user.id;

    const car = await Car.findById(car_id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    // Check date-based conflicts (ignores the static availability flag which
    // can be stale — we manage it ourselves below)
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
    } catch (calcErr) {
      return res.status(400).json({ success: false, message: calcErr.message });
    }

    const bookingId = await Booking.create({ user_id, car_id, start_date, end_date, total_price });

    // Mark the car as unavailable now that it has an active booking
    await Car.update(car_id, { availability: false });

    const booking = await Booking.findById(bookingId);
    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findByUser(req.user.id);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.findAll();
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`,
      });
    }

    await Booking.updateStatus(req.params.id, 'cancelled');

    // Restore car availability if no other active bookings remain
    const stillBooked = await Booking.hasActiveBookings(booking.car_id, req.params.id);
    if (!stillBooked) {
      await Car.update(booking.car_id, { availability: true });
    }

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await Booking.updateStatus(req.params.id, status);

    // When a booking ends (completed or cancelled), restore car availability
    // if no other active bookings remain for that car
    if (status === 'completed' || status === 'cancelled') {
      const stillBooked = await Booking.hasActiveBookings(booking.car_id, req.params.id);
      if (!stillBooked) {
        await Car.update(booking.car_id, { availability: true });
      }
    }

    res.json({ success: true, message: `Booking status updated to '${status}'` });
  } catch (err) {
    next(err);
  }
};