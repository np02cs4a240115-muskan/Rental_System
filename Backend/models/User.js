// models/User.js
'use strict';

const db     = require('../config/db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const User = {
  // ─── Finders ─────────────────────────────────────────────────────────────

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

  /**
   * Flexible lookup: accepts either an e-mail address or a phone number.
   * Detects by presence of '@' — phone numbers never contain it.
   */
  async findByCredential(identifier) {
    const isEmail = identifier.includes('@');
    return isEmail
      ? this.findByEmail(identifier)
      : this.findByPhone(identifier);
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  // ─── Mutation ─────────────────────────────────────────────────────────────

  /**
   * Create a user.
   * - role defaults to 'user'; callers may pass 'admin' when permitted.
   * - phone is stored as-is; the UNIQUE constraint on the column prevents
   *   duplicates at the database level in addition to the controller check.
   */
  async create({ name, email, password, phone = null, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null, role]
    );
    return result.insertId;
  },

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = User;
