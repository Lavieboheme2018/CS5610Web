const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getBucket } = require('../db');

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
}).single('profileImage');

// Get user profile (Protected route)
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile (Protected route)
router.put('/profile', auth, async (req, res) => {
  const { email, password, username } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }
    if (username) user.username = username;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ message: "Profile updated successfully", user: userResponse });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload profile image (Protected route)
router.post('/profile-image', auth, async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const bucket = getBucket();
      if (!bucket) {
        throw new Error('GridFS bucket not initialized');
      }

      // Delete old file if exists
      if (user.profileImage && user.profileImage.fileId) {
        try {
          await bucket.delete(new mongoose.Types.ObjectId(user.profileImage.fileId));
        } catch (deleteErr) {
          console.error('Error deleting old file:', deleteErr);
        }
      }

      // Create unique filename
      const filename = `${Date.now()}-${req.file.originalname}`;

      return new Promise((resolve, reject) => {
        // Create upload stream
        const uploadStream = bucket.openUploadStream(filename, {
          contentType: req.file.mimetype,
          metadata: { userId: req.user.id }
        });

        // Handle upload completion
        uploadStream.on('finish', async () => {
          try {
            user.profileImage = {
              fileId: uploadStream.id,
              filename: filename
            };
            await user.save();

            res.json({
              message: 'Profile image uploaded successfully',
              filename: filename
            });
            resolve();
          } catch (error) {
            console.error('Error saving user after upload:', error);
            res.status(500).json({ message: 'Error saving user after upload' });
            reject(error);
          }
        });

        // Handle upload error
        uploadStream.on('error', (error) => {
          console.error('Error in upload stream:', error);
          res.status(500).json({ message: 'Error uploading file' });
          reject(error);
        });

        // Write file buffer to stream
        uploadStream.write(req.file.buffer);
        uploadStream.end();
      });

    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ message: error.message });
    }
  });
});

// Get profile image
router.get('/image/:filename', async (req, res) => {
  try {
    const bucket = getBucket();
    if (!bucket) {
      throw new Error('GridFS bucket not initialized');
    }

    const cursor = bucket.find({ filename: req.params.filename });
    const file = await cursor.next();
    
    if (!file) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.set('Content-Type', file.contentType);
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving image:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete profile image (Protected route)
router.delete('/profile-image', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.profileImage.fileId) {
      return res.status(404).json({ message: 'No profile image found' });
    }

    const bucket = getBucket();
    if (!bucket) {
      throw new Error('GridFS bucket not initialized');
    }

    await bucket.delete(new mongoose.Types.ObjectId(user.profileImage.fileId));
    
    user.profileImage = {
      fileId: null,
      filename: null
    };
    await user.save();

    res.json({ message: 'Profile image removed successfully' });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;