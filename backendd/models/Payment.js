const db = require('../config/db');

const Payment = {
  async create({ booking_id, amount, payment_method = 'cash' }) {
    const [result] = await db.execute(
      `INSERT INTO payments (booking_id, amount, payment_method)
       VALUES (?, ?, ?)`,
      [booking_id, amount, payment_method]
    );
    return result.insertId;
  },

  async findByBookingId(bookingId) {
    const [rows] = await db.execute(
      'SELECT * FROM payments WHERE booking_id = ? LIMIT 1',
      [bookingId]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM payments WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async updateStatus(id, payment_status) {
    const [result] = await db.execute(
      'UPDATE payments SET payment_status = ? WHERE id = ?',
      [payment_status, id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Payment;