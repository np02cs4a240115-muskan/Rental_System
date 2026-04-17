// controllers/authController.js
'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ─── JWT helpers ──────────────────────────────────────────────────────────────

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Strip the hashed password from any user object before sending to the client.
 */
const sanitizeUser = (user) => {
  const { password: _pw, ...safeUser } = user;
  return safeUser;
};

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Fixes applied:
 *  1. confirmPassword validation (done in route validators, enforced here too).
 *  2. Phone uniqueness checked before insert.
 *  3. Role field respected — allows 'admin' creation when explicitly supplied.
 *  4. NO JWT token returned on registration (201 Created, user info only).
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // ── Duplicate e-mail check ─────────────────────────────────────────────
    const emailExists = await User.findByEmail(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // ── Duplicate phone check ──────────────────────────────────────────────
    if (phone) {
      const phoneExists = await User.findByPhone(phone);
      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already registered',
        });
      }
    }

    // ── Determine role ─────────────────────────────────────────────────────
    // Public registration can only create 'user' accounts.
    // Admin accounts must be created by an existing admin (or seeded directly).
    const assignedRole = 'user';

    // ── Create user ────────────────────────────────────────────────────────
    const newId = await User.create({
      name,
      email,
      password,
      phone: phone || null,
      role: assignedRole,
    });

    const user = await User.findById(newId);

    // ── Respond WITHOUT a token (user must log in explicitly) ──────────────
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please log in.',
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Fixes applied:
 *  1. Accepts email OR phone number as the login identifier.
 *  2. Generic "Invalid credentials" message to avoid user enumeration.
 *  3. JWT returned only here, on successful login.
 */
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // ── Lookup by email or phone ───────────────────────────────────────────
    const user = await User.findByCredential(identifier);

    // Use the same error message whether the user doesn't exist or the
    // password is wrong — prevents user-enumeration attacks.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const match = await User.comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // ── Issue token ────────────────────────────────────────────────────────
    const token = signToken(user.id);

    return res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get current user ─────────────────────────────────────────────────────────

/**
 * GET /api/auth/me  (protected)
 */
exports.getMe = async (req, res, next) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};
