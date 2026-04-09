// routes/userRoutes.js

const express = require('express');
const router  = express.Router();

const userController        = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET  /api/users/profile  – current user's profile
router.get('/profile', userController.getProfile);

// PUT  /api/users/profile  – update current user's profile
router.put('/profile', userController.updateProfile);

// GET  /api/users          – admin only: list all users
router.get('/', restrictTo('admin'), userController.getAllUsers);

module.exports = router;
