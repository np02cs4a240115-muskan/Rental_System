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

    if (!car.availability) {
      return res.status(400).json({ success: false, message: 'Car is not available for booking' });
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
    } catch (calcErr) {
      return res.status(400).json({ success: false, message: calcErr.message });
    }

    const bookingId = await Booking.create({ user_id, car_id, start_date, end_date, total_price });
    const booking   = await Booking.findById(bookingId);

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

    if (req.user.role !== 'admin' && Number(booking.user_id) !== Number(req.user.id)) {
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

    if (req.user.role !== 'admin' && Number(booking.user_id) !== Number(req.user.id)) {
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
    res.json({ success: true, message: `Booking status updated to '${status}'` });
  } catch (err) {
    next(err);
  }
};
