// routes/authRoutes.js
'use strict';

const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const authController = require('../controllers/authController');
const { protect }    = require('../middleware/auth');
const validate       = require('../middleware/validate');

// ─── Shared validators ────────────────────────────────────────────────────────

const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/\d/)
  .withMessage('Password must contain at least one number');

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name must be 100 characters or fewer'),

    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),

    body('phone')
      .optional({ nullable: true, checkFalsy: true })
      .isMobilePhone('any', { strictMode: false })
      .withMessage('Invalid phone number format')
      .isLength({ max: 20 })
      .withMessage('Phone number too long'),

    passwordValidator,

    // confirmPassword: must match password
    body('confirmPassword')
      .notEmpty()
      .withMessage('Password confirmation is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),

    // role: optional, only 'user' or 'admin' accepted
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage("Role must be 'user' or 'admin'"),
  ],
  validate,
  authController.register
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
//
// Login accepts EITHER an e-mail address OR a phone number via the
// 'identifier' field, plus the user's password.
//
router.post(
  '/login',
  [
    body('identifier')
      .trim()
      .notEmpty()
      .withMessage('Email or phone number is required'),

    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// ─── GET /api/auth/me (protected) ─────────────────────────────────────────────
router.get('/me', protect, authController.getMe);

module.exports = router;
