const db     = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async findByPhone(phone) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE phone = ? LIMIT 1',
      [phone]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, image, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password, phone, role = 'user' }) {
    const salt           = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, role]
    );
    return result.insertId;
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // Creates a user that authenticated via Google (no local password)
  async createGoogleUser({ name, email, googleId, image = null, role = 'user' }) {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, role, google_id, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, '', null, role, googleId, image]
    );
    return result.insertId;
  },
};

module.exports = User;
