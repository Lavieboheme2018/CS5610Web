const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');

// Create a new pet (Protected route)
router.post('/create', auth, async (req, res) => {
  const { name, age, breed } = req.body;
  try {
    const newPet = new Pet({
      name,
      age,
      breed,
      owner: req.user.id, // Bind pet to the logged-in user
    });
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pets for a user (Protected route)
router.get('/user', auth, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id }); // Fetch pets belonging to the user
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a pet's information (Protected route)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, age, breed } = req.body;

  try {
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.user.id }, // Ensure only the owner can update
      { name, age, breed },
      { new: true } // Return the updated document
    );

    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a pet (Protected route)
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPet = await Pet.findOneAndDelete({
      _id: id,
      owner: req.user.id, // Ensure only the owner can delete
    });

    if (!deletedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search pets (Protected route)
router.get('/search', auth, async (req, res) => {
  const { name, breed } = req.query; // Search by name or breed
  try {
    const query = { owner: req.user.id }; // Restrict search to the logged-in user's pets
    if (name) query.name = { $regex: name, $options: 'i' }; // Case-insensitive search for name
    if (breed) query.breed = { $regex: breed, $options: 'i' }; // Case-insensitive search for breed

    const pets = await Pet.find(query);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add weight entry (Protected route)
router.post('/:id/weight', auth, async (req, res) => {
  const { id } = req.params;
  const { weight } = req.body; // Only weight is required

  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      {
        $push: {
          weightTrend: {
            date: new Date(), // Automatically add current date
            weight,
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add vaccination record (Protected route)
router.post('/:id/vaccination', auth, async (req, res) => {
  const { id } = req.params;
  const { vaccine, date } = req.body;

  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.user.id }, // Ensure only the owner can update
      { $push: { vaccinationHistory: { vaccine, date } } },
      { new: true } // Return the updated document
    );

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pet details by ID (Protected route)
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findOne({ _id: id, owner: req.user.id });

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Add the latest weight dynamically from weightTrend
    const latestWeight = pet.weightTrend.length
      ? pet.weightTrend[pet.weightTrend.length - 1]
      : null;

    res.json({
      ...pet.toObject(),
      latestWeight, // Include latest weight in the response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;