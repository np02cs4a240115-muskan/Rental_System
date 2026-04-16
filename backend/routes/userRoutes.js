// routes/userRoutes.js
'use strict';

const express = require('express');
const router  = express.Router();

const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

// GET /api/users/profile
router.get('/profile', userController.getProfile);

// PUT /api/users/profile
router.put('/profile', userController.updateProfile);

// GET /api/users  – admin only
router.get('/', restrictTo('admin'), userController.getAllUsers);

module.exports = router;
