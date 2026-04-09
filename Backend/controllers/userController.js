const db = require('../config/db');

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

    await db.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name || req.user.name, phone || req.user.phone, userId]
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