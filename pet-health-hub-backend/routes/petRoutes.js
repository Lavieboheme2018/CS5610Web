const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

// Create a new pet
router.post('/create', async (req, res) => {
  const { name, age, breed, weight, ownerId } = req.body; // ownerId is the User ID
  try {
    const newPet = new Pet({ name, age, breed, weight, owner: ownerId });
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pets for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.params.userId });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;