// routes/carRoutes.js

const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const carController           = require('../controllers/carController');
const { protect, restrictTo } = require('../middleware/auth');
const validate                = require('../middleware/validate');

// Public routes
router.get('/',    carController.getAllCars);
router.get('/:id', carController.getCar);

// Admin-only routes
router.post(
  '/',
  protect,
  restrictTo('admin'),
  [
    body('name').trim().notEmpty().withMessage('Car name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('model').trim().notEmpty().withMessage('Model is required'),
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Valid year is required'),
    body('price_per_day')
      .isFloat({ min: 0.01 })
      .withMessage('Price per day must be a positive number'),
  ],
  validate,
  carController.createCar
);

router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  [
    body('price_per_day')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Price per day must be a positive number'),
    body('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage('Valid year is required'),
  ],
  validate,
  carController.updateCar
);

router.delete('/:id', protect, restrictTo('admin'), carController.deleteCar);

module.exports = router;
