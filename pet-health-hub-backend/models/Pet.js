const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  breed: { type: String },
  weight: { type: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User reference
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pet', PetSchema);