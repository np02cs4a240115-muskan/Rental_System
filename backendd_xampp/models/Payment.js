const db = require('../config/db');

const Payment = {
  async create({ booking_id, amount, payment_method = 'cash', payment_status = 'pending' }) {
    const [result] = await db.execute(
      `INSERT INTO payments (booking_id, amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?)`,
      [booking_id, amount, payment_method, payment_status]
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

  async updateForBooking(bookingId, fields) {
    const allowed = ['amount', 'payment_method', 'payment_status', 'transaction_uuid'];
    const keys = Object.keys(fields).filter(key => allowed.includes(key));
    if (keys.length === 0) return false;

    const setParts = keys.map(key => `${key} = ?`).join(', ');
    const values = keys.map(key => fields[key]);
    values.push(bookingId);

    const [result] = await db.execute(
      `UPDATE payments SET ${setParts} WHERE booking_id = ?`,
      values
    );
    return result.affectedRows > 0;
  },
};

module.exports = Payment;
