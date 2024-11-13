// routes/petRoutes.js
const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');

// Create a new pet (Protected route)
router.post('/create', auth, async (req, res) => {
  const { name, age, breed, weight } = req.body;
  try {
    const newPet = new Pet({ name, age, breed, weight, owner: req.user.id });
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pets for a user (Protected route)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.params.userId });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;