'use strict';

const bcrypt = require('bcryptjs');
const db = require('../config/db');

const SALT_ROUNDS = 12;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizePhone = (phone) => {
  const cleaned = String(phone || '').replace(/[^\d+]/g, '');
  return cleaned || null;
};

const User = {
  async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [normalizeEmail(email)]);
    return rows[0] || null;
  },

  async findByPhone(phone) {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return null;

    const [rows] = await db.execute('SELECT * FROM users WHERE phone = ? LIMIT 1', [normalizedPhone]);
    return rows[0] || null;
  },

  async findByCredential(identifier) {
    const credential = String(identifier || '').trim();
    if (credential.includes('@')) {
      return this.findByEmail(identifier);
    }
    return this.findByPhone(credential);
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password, phone = null, role = 'user' }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [String(name || '').trim(), normalizeEmail(email), hashedPassword, normalizePhone(phone), role]
    );
    return result.insertId;
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  // NEW: update password by email
  async updatePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, normalizeEmail(email)]);
  },

  normalizePhone,
};

module.exports = User;
