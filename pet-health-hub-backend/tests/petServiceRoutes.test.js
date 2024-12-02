const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const PetService = require('../models/PetService');
const petServiceRoutes = require('../routes/petServiceRoutes');

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  app = express();
  app.use(express.json());
  app.use('/api', petServiceRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await PetService.deleteMany({});
});

describe('POST /api/services', () => {
  const validService = {
    name: 'Pet Paradise',
    location: {
      lat: 42.3601,
      lng: -71.0589
    },
    address: '123 Pet Street',
    rating: 4.5,
    contact: '123-456-7890'
  };

  it('should create a new pet service', async () => {
    const res = await request(app)
      .post('/api/services')
      .send(validService)
      .expect(201);

    expect(res.body.message).toBe('Service saved successfully');

    const savedService = await PetService.findOne({ name: 'Pet Paradise' });
    expect(savedService).toBeTruthy();
    expect(savedService.location.lat).toBe(42.3601);
    expect(savedService.location.lng).toBe(-71.0589);
  });

  it('should handle invalid data', async () => {
    const invalidService = {
      name: 'Pet Paradise',
      location: { lat: 42.3601 } // Missing lng
    };

    await request(app)
      .post('/api/services')
      .send(invalidService)
      .expect(500);
  });
});

describe('GET /api/services', () => {
  it('should retrieve all pet services', async () => {
    const services = [
      {
        name: 'Pet Paradise',
        location: { lat: 42.3601, lng: -71.0589 },
        address: '123 Pet Street',
        rating: 4.5,
        contact: '123-456-7890'
      },
      {
        name: 'Vet Clinic',
        location: { lat: 40.7128, lng: -74.0060 },
        address: '456 Vet Avenue',
        rating: 4.8,
        contact: '987-654-3210'
      }
    ];

    await PetService.create(services);

    const res = await request(app)
      .get('/api/services')
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Pet Paradise');
    expect(res.body[0].location).toEqual({ lat: 42.3601, lng: -71.0589 });
  });

  it('should return empty array when no services exist', async () => {
    const res = await request(app)
      .get('/api/services')
      .expect(200);

    expect(res.body).toEqual([]);
  });
});