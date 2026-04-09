// server.js
// Application entry point – wires together Express, middleware, and routes

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

// ── Route imports ──────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const userRoutes    = require('./routes/userRoutes');
const carRoutes     = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// ── Error handlers ─────────────────────────────────────────────
const { notFound, errorHandler } = require('./middleware/errorHandler');

// ── Initialise DB pool (side-effect: tests connection on startup)
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Global middleware ──────────────────────────────────────────
app.use(cors());                          // allow cross-origin requests
app.use(express.json());                  // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse URL-encoded bodies

// ── Health check ───────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Car Rental API is running 🚗',
    version: '1.0.0',
    endpoints: {
      auth:     '/api/auth',
      users:    '/api/users',
      cars:     '/api/cars',
      bookings: '/api/bookings',
      payments: '/api/payments',
    },
  });
});

// ── API routes ─────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/cars',     carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// ── 404 + global error handler (must be last) ──────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app; // exported for testing
