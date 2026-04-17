// routes/carRoutes.js
'use strict';

const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const carController = require('../controllers/carController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

// GET /api/cars  – public
router.get('/', carController.getAllCars);

// GET /api/cars/:id  – public
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('Valid car id required')],
  validate,
  carController.getCar
);

// POST /api/cars  – admin only
router.post(
  '/',
  protect,
  restrictTo('admin'),
  [
    body('name').trim().notEmpty().withMessage('Car name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year required'),
    body('price_per_day').isFloat({ min: 0.01 }).withMessage('Price per day must be greater than 0'),
  ],
  validate,
  carController.createCar
);

// PUT /api/cars/:id  – admin only
router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  [param('id').isInt({ min: 1 }).withMessage('Valid car id required')],
  validate,
  carController.updateCar
);

// DELETE /api/cars/:id  – admin only
router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  [param('id').isInt({ min: 1 }).withMessage('Valid car id required')],
  validate,
  carController.deleteCar
);

module.exports = router;
