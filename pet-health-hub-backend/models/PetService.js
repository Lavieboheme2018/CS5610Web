const mongoose = require('mongoose');

const PetServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  address: { type: String, required: true },
  rating: { type: Number, default: 0 },
  contact: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PetService', PetServiceSchema);
