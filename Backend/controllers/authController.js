const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendToken = (res, statusCode, user, token) => {
  const { password: _pw, ...safeUser } = user;
  res.status(statusCode).json({
    success: true,
    token,
    user: safeUser,
  });
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register
// Registers a regular user. No JWT returned — user must log in.
// ─────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirm_password, phone } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

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

    await User.create({ name, email, password, phone, role: 'user' });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please log in.',
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/register/admin   (admin-only)
// Creates a new admin account. Caller must be authenticated as admin.
// ─────────────────────────────────────────────────────────────
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, confirm_password, phone } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

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

    const newId = await User.create({ name, email, password, phone, role: 'admin' });
    const user  = await User.findById(newId);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
// identifier = email address OR phone number
// ─────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    let user;
    if (isEmail) {
      user = await User.findByEmail(identifier);
    } else {
      user = await User.findByPhone(identifier);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google Sign-In. Please log in with Google.',
      });
    }

    const match = await User.comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    const safeUser = await User.findById(user.id);
    sendToken(res, 200, safeUser, token);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected)
// ─────────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/auth/google
// Body: { id_token: "<Google ID token from the frontend>" }
// Works for both sign-up and sign-in.
// ─────────────────────────────────────────────────────────────
exports.googleAuth = async (req, res, next) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({ success: false, message: 'id_token is required' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid Google token' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account has no email' });
    }

    let user = await User.findByEmail(email);

    if (user) {
      const token = signToken(user.id);
      const safeUser = await User.findById(user.id);
      return sendToken(res, 200, safeUser, token);
    }

    const newId = await User.createGoogleUser({ name, email, googleId, image: picture });
    const newUser = await User.findById(newId);
    const token = signToken(newId);

    sendToken(res, 201, newUser, token);
  } catch (err) {
    next(err);
  }
};
