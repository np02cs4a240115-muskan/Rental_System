const db = require('../config/db');

const Car = {
  async findAll(availableOnly = false, vendorId = null) {
    const where = [];
    const params = [];

    if (availableOnly) where.push('c.availability = TRUE');
    if (vendorId) {
      where.push('c.vendor_id = ?');
      params.push(vendorId);
    }

    const sql = `
      SELECT c.*, u.name AS vendor_name, u.email AS vendor_email
      FROM cars c
      LEFT JOIN users u ON u.id = c.vendor_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY c.created_at DESC
    `;
    const [rows] = await db.execute(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT c.*, u.name AS vendor_name, u.email AS vendor_email
       FROM cars c
       LEFT JOIN users u ON u.id = c.vendor_id
       WHERE c.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, brand, model, year, price_per_day, availability = true, image, vendor_id = null }) {
    const [result] = await db.execute(
      `INSERT INTO cars (name, brand, model, year, price_per_day, availability, image, vendor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, model, year, price_per_day, availability, image || null, vendor_id]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const allowed = ['name', 'brand', 'model', 'year', 'price_per_day', 'availability', 'image', 'vendor_id'];
    const keys = Object.keys(fields).filter(k => allowed.includes(k));

    if (keys.length === 0) return false;

    const setParts = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => fields[k]);
    values.push(id);

    const [result] = await db.execute(
      `UPDATE cars SET ${setParts} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM cars WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Car;
