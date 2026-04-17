// controllers/userController.js
'use strict';

const db   = require('../config/db');
const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    // ── Phone uniqueness check (only when a new phone value is provided) ───
    if (phone && phone !== req.user.phone) {
      const existing = await User.findByPhone(phone);
      if (existing && Number(existing.id) !== Number(userId)) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already in use by another account',
        });
      }
    }

    // Allow undefined → keep existing; allow null/'' → clear the field
    const newName  = name  !== undefined ? name           : req.user.name;
    const newPhone = phone !== undefined ? (phone || null) : req.user.phone;

    await db.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [newName, newPhone, userId]
    );

    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, count: rows.length, users: rows });
  } catch (err) {
    next(err);
  }
};

// POST /api/users  – admin creates a new user (can assign any role)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const emailExists = await User.findByEmail(email);
    if (emailExists) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    if (phone) {
      const phoneExists = await User.findByPhone(phone);
      if (phoneExists) {
        return res.status(409).json({ success: false, message: 'Phone number already registered' });
      }
    }

    const allowedRoles = ['user', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'user';

    const newId = await User.create({ name, email, password, phone: phone || null, role: assignedRole });
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [newId]
    );

    res.status(201).json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};
