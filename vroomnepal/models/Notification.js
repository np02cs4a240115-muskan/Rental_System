const db = require('../config/db');

const Notification = {
  async create({ user_id, type = 'info', title, message, booking_id = null, car_id = null }) {
    if (!user_id) return null;

    const [result] = await db.execute(
      `INSERT INTO notifications (user_id, type, title, message, booking_id, car_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, type, title, message, booking_id, car_id]
    );
    return result.insertId;
  },

  async findByUser(userId) {
    const [rows] = await db.execute(
      `SELECT n.*, b.status AS booking_status, c.name AS car_name
       FROM notifications n
       LEFT JOIN bookings b ON b.id = n.booking_id
       LEFT JOIN cars c ON c.id = n.car_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );
    return rows;
  },

  async unreadCount(userId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return rows[0]?.count || 0;
  },

  async markAllRead(userId) {
    const [result] = await db.execute(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows;
  },
};

module.exports = Notification;
