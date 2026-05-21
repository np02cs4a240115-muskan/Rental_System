'use strict';

const db = require('../config/db');
const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;
    const normalizedPhone = phone !== undefined ? User.normalizePhone(phone) : req.user.phone;

    if (normalizedPhone && normalizedPhone !== req.user.phone) {
      const existingUser = await User.findByPhone(normalizedPhone);
      if (existingUser && Number(existingUser.id) !== Number(userId)) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already in use by another account',
        });
      }
    }

    const newName = name !== undefined ? String(name).trim() : req.user.name;
    const newPhone = phone !== undefined ? normalizedPhone : req.user.phone;

    await db.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [newName, newPhone, userId]
    );

    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ success: true, count: rows.length, users: rows });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    if (phone) {
      const existingPhone = await User.findByPhone(phone);
      if (existingPhone) {
        return res.status(409).json({ success: false, message: 'Phone number already registered' });
      }
    }

    const allowedRoles = ['user', 'vendor', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'user';

    const newUserId = await User.create({
      name,
      email,
      password,
      phone: phone || null,
      role: assignedRole,
    });

    const [rows] = await db.execute(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    res.status(201).json({ success: true, user: rows[0] });
  } catch (error) {
    next(error);
  }
};
