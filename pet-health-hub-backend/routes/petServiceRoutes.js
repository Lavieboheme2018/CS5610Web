const express = require('express');
const PetService = require('../models/PetService');
const router = express.Router();

// Route to save a pet service
router.post('/api/services', async (req, res) => {
  console.log('Received request to save service'); //debug 
  const { name, location, address, rating, contact } = req.body;

  try {
    const newService = new PetService({
      name,
      location,
      address,
      rating,
      contact,
    });
    await newService.save();
    console.log('Service saved successfully');  //debug 
    res.status(201).json({ message: 'Service saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving service', error });
  }
}); 

// Route to retrieve all pet services
router.get('/api/services', async (req, res) => {
  try {
    const services = await PetService.find(); // Fetch all services from the database
    res.json(services); // Send the services as JSON response
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
});

module.exports = router;
