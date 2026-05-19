const db = require('../config/db');

const Car = {
  async findAll(availableOnly = false) {
    const sql = availableOnly
      ? 'SELECT * FROM cars WHERE availability = TRUE ORDER BY created_at DESC'
      : 'SELECT * FROM cars ORDER BY created_at DESC';
    const [rows] = await db.execute(sql);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM cars WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, brand, model, year, price_per_day, availability = true, image }) {
    const [result] = await db.execute(
      `INSERT INTO cars (name, brand, model, year, price_per_day, availability, image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, model, year, price_per_day, availability, image || null]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const allowed = ['name', 'brand', 'model', 'year', 'price_per_day', 'availability', 'image'];
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