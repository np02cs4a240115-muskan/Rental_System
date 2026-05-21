const db = require('../config/db');

const Booking = {
  async isCarBooked(carId, startDate, endDate, excludeBookingId = null) {
    let sql = `
      SELECT COUNT(*) AS cnt
      FROM   bookings
      WHERE  car_id = ?
        AND  status IN ('pending', 'confirmed')
        AND  start_date < ?
        AND  end_date > ?
    `;
    const params = [carId, endDate, startDate];

    if (excludeBookingId) {
      sql += ' AND id != ?';
      params.push(excludeBookingId);
    }

    const [rows] = await db.execute(sql, params);
    return rows[0].cnt > 0;
  },

  calcTotalPrice(startDate, endDate, pricePerDay) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days < 1) throw new Error('end_date must be after start_date');
    const base = days * pricePerDay;
    const serviceFee = Math.max(250, Math.round(base * 0.03));
    const insurance = Math.max(500, Math.round(base * 0.05));
    return +(base + serviceFee + insurance).toFixed(2);
  },

  async create({ user_id, car_id, start_date, end_date, total_price }) {
    const [result] = await db.execute(
      `INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, car_id, start_date, end_date, total_price]
    );
    return result.insertId;
  },

  async findByUser(userId) {
    const [rows] = await db.execute(
      `SELECT b.*, c.name AS car_name, c.brand, c.model, c.image, c.vendor_id,
              v.name AS vendor_name, v.email AS vendor_email
       FROM   bookings b
       JOIN   cars     c ON c.id = b.car_id
       LEFT JOIN users v ON v.id = c.vendor_id
       WHERE  b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await db.execute(
      `SELECT b.*, u.name AS user_name, u.email,
              c.name AS car_name, c.brand, c.model, c.image, c.vendor_id,
              v.name AS vendor_name, v.email AS vendor_email
       FROM   bookings b
       JOIN   users u ON u.id = b.user_id
       JOIN   cars  c ON c.id = b.car_id
       LEFT JOIN users v ON v.id = c.vendor_id
       ORDER BY b.created_at DESC`
    );
    return rows;
  },

  async findByVendor(vendorId) {
    const [rows] = await db.execute(
      `SELECT b.*, u.name AS user_name, u.email,
              c.name AS car_name, c.brand, c.model, c.image, c.vendor_id,
              v.name AS vendor_name, v.email AS vendor_email
       FROM   bookings b
       JOIN   users u ON u.id = b.user_id
       JOIN   cars  c ON c.id = b.car_id
       LEFT JOIN users v ON v.id = c.vendor_id
       WHERE  c.vendor_id = ?
       ORDER BY b.created_at DESC`,
      [vendorId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT b.*, u.name AS user_name, u.email,
              c.price_per_day, c.name AS car_name, c.brand, c.model, c.image, c.vendor_id,
              v.name AS vendor_name, v.email AS vendor_email
       FROM   bookings b
       JOIN   users u ON u.id = b.user_id
       JOIN   cars  c ON c.id = b.car_id
       LEFT JOIN users v ON v.id = c.vendor_id
       WHERE  b.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Booking;
