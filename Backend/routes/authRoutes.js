// routes/authRoutes.js

const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const authController          = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const validate                = require('../middleware/validate');

// ── Shared validators ────────────────────────────────────────
const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirm_password')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match');
      return true;
    }),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
];

// ── POST /api/auth/register  – public, creates a regular user, no JWT returned ──
router.post('/register', registerValidators, validate, authController.register);

// ── POST /api/auth/register/admin  – admin-only, creates an admin account ──
router.post(
  '/register/admin',
  protect,
  restrictTo('admin'),
  registerValidators,
  validate,
  authController.registerAdmin
);

// ── POST /api/auth/login  – identifier = email OR phone ──
router.post(
  '/login',
  [
    body('identifier')
      .notEmpty()
      .withMessage('Email or phone number is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  authController.login
);

// ── GET /api/auth/me  (protected) ──
router.get('/me', protect, authController.getMe);

// ── POST /api/auth/google  – Google OAuth (login or register) ──
// Body: { id_token: string }  — the ID token from Google Sign-In on the frontend
router.post(
  '/google',
  [body('id_token').notEmpty().withMessage('id_token is required')],
  validate,
  authController.googleAuth
);

module.exports = router;
