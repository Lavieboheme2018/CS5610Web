// models/Pet.js
const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  breed: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profileImage: {
    filename: String,
    contentType: String,
    uploadDate: Date
  },
  weightTrend: [{
    date: { type: Date, required: true },
    weight: { type: Number, required: true }
  }],
  vaccinationHistory: [{
    vaccine: { type: String, required: true },
    date: { type: Date, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', PetSchema);