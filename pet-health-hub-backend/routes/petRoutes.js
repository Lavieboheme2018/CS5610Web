const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');
const multer = require('multer');
const { getBucket } = require('../db');
const { ObjectId } = require('mongodb');
const stream = require('stream');

// Configure multer for memory storage
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Create a new pet
router.post('/create', auth, async (req, res) => {
  const { name, age, breed } = req.body;
  try {
    const newPet = new Pet({
      name,
      age,
      breed,
      owner: req.user.id,
      weightTrend: [], // Initialize empty arrays
      vaccinationHistory: []
    });
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all pets for a user
router.get('/user', auth, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user.id });
    res.json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get pet details by ID
router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findOne({ _id: id, owner: req.user.id });

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    const latestWeight = pet.weightTrend.length
      ? pet.weightTrend[pet.weightTrend.length - 1]
      : null;

    res.json({
      ...pet.toObject(),
      latestWeight,
    });
  } catch (error) {
    console.error('Error fetching pet details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update pet's basic information
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, age, breed } = req.body;

  try {
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { name, age, breed },
      { new: true }
    );

    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a pet
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const pet = await Pet.findOne({ _id: id, owner: req.user.id });
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Delete pet's image if it exists
    if (pet.profileImage && pet.profileImage.filename) {
      try {
        const fileId = new ObjectId(pet.profileImage.filename);
        await getBucket().delete(fileId);
      } catch (error) {
        console.error('Error deleting pet image:', error);
      }
    }

    await pet.deleteOne();
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload/update pet profile image
router.post('/:id/profile-image', auth, upload.single('profileImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { id } = req.params;
  try {
    // Find pet and verify ownership
    const pet = await Pet.findOne({ _id: id, owner: req.user.id });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // If there's an existing image, delete it
    if (pet.profileImage && pet.profileImage.filename) {
      try {
        const oldFileId = new ObjectId(pet.profileImage.filename);
        await getBucket().delete(oldFileId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Create a buffer stream from the uploaded file
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    // Generate unique filename
    const filename = new ObjectId();
    
    // Upload to GridFS
    const uploadStream = getBucket().openUploadStreamWithId(filename, req.file.originalname, {
      contentType: req.file.mimetype
    });

    await new Promise((resolve, reject) => {
      bufferStream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    // Update only the profileImage field
    const updatedPet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      {
        $set: {
          profileImage: {
            filename: filename.toString(),
            contentType: req.file.mimetype,
            uploadDate: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json({ 
      message: 'Profile image uploaded successfully',
      filename: filename.toString()
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: error.message });
  }
});

// Retrieve pet image
router.get('/image/:filename', auth, async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.filename);
    const downloadStream = getBucket().openDownloadStream(fileId);
    
    downloadStream.on('file', (file) => {
      res.set('Content-Type', file.contentType);
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ message: 'Error retrieving image' });
  }
});

// Add weight record
router.post('/:id/weight', auth, async (req, res) => {
  const { id } = req.params;
  const { weight } = req.body;

  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      {
        $push: {
          weightTrend: {
            date: new Date(),
            weight,
          },
        },
      },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error adding weight record:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add vaccination record
router.post('/:id/vaccination', auth, async (req, res) => {
  const { id } = req.params;
  const { vaccine, date } = req.body;

  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      { 
        $push: { 
          vaccinationHistory: { 
            vaccine, 
            date: new Date(date) 
          } 
        } 
      },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error adding vaccination record:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search pets
router.get('/search', auth, async (req, res) => {
  const { name, breed } = req.query;
  try {
    const query = { owner: req.user.id };
    if (name) query.name = { $regex: name, $options: 'i' };
    if (breed) query.breed = { $regex: breed, $options: 'i' };

    const pets = await Pet.find(query);
    res.json(pets);
  } catch (error) {
    console.error('Error searching pets:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update weight record
router.put('/:petId/weight/:recordId', auth, async (req, res) => {
  const { petId, recordId } = req.params;
  const { weight, date } = req.body;

  try {
    const pet = await Pet.findOneAndUpdate(
      { 
        _id: petId, 
        owner: req.user.id,
        'weightTrend._id': recordId 
      },
      { 
        $set: { 
          'weightTrend.$': {
            _id: recordId,
            weight,
            date: new Date(date)
          }
        }
      },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error updating weight record:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update vaccination record
router.put('/:petId/vaccination/:recordId', auth, async (req, res) => {
  const { petId, recordId } = req.params;
  const { vaccine, date } = req.body;

  try {
    const pet = await Pet.findOneAndUpdate(
      { 
        _id: petId, 
        owner: req.user.id,
        'vaccinationHistory._id': recordId 
      },
      { 
        $set: { 
          'vaccinationHistory.$': {
            _id: recordId,
            vaccine,
            date: new Date(date)
          }
        }
      },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error updating vaccination record:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete weight record
router.delete('/:petId/weight/:recordId', auth, async (req, res) => {
  const { petId, recordId } = req.params;

  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: petId, owner: req.user.id },
      { $pull: { weightTrend: { _id: recordId } } },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error deleting weight record:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete vaccination record
router.delete('/:petId/vaccination/:recordId', auth, async (req, res) => {
  const { petId, recordId } = req.params;

  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: petId, owner: req.user.id },
      { $pull: { vaccinationHistory: { _id: recordId } } },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('Error deleting vaccination record:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;