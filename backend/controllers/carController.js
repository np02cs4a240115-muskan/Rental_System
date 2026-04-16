const Car = require('../models/Car');

exports.getAllCars = async (req, res, next) => {
  try {
    const availableOnly = req.query.available === 'true';
    const cars = await Car.findAll(availableOnly);
    res.json({ success: true, count: cars.length, cars });
  } catch (err) {
    next(err);
  }
};

exports.getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }
    res.json({ success: true, car });
  } catch (err) {
    next(err);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const { name, brand, model, year, price_per_day, availability, image } = req.body;

    const id = await Car.create({ name, brand, model, year, price_per_day, availability, image });
    const car = await Car.findById(id);

    res.status(201).json({ success: true, car });
  } catch (err) {
    next(err);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    const updated = await Car.update(req.params.id, req.body);
    if (!updated) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const updatedCar = await Car.findById(req.params.id);
    res.json({ success: true, car: updatedCar });
  } catch (err) {
    next(err);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    await Car.delete(req.params.id);
    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (err) {
    next(err);
  }
};
