const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Readable, Writable } = require('stream');
const axios = require('axios');
const Pet = require('../models/Pet');
const petRoutes = require('../routes/petRoutes');
const auth = require('../middleware/auth');
const { getBucket } = require('../db');

jest.mock('../middleware/auth');
jest.mock('../db');
jest.mock('axios');

let app;
let mongoServer;
const userId = new mongoose.Types.ObjectId();
const petId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  app = express();
  app.use(express.json());
  app.use('/api/pets', petRoutes);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(() => {
  auth.mockImplementation((req, res, next) => {
    req.user = { id: userId.toString() };
    next();
  });
});

afterEach(async () => {
  jest.clearAllMocks();
  await Pet.deleteMany({});
});

describe('GET /api/pets/breeds', () => {
  it('should fetch breeds from APIs', async () => {
    const mockDogBreeds = [{ id: 1, name: 'Labrador' }];
    const mockCatBreeds = [{ id: 2, name: 'Persian' }];

    axios.get.mockImplementation((url) => {
      if (url.includes('dog')) {
        return Promise.resolve({ data: mockDogBreeds });
      }
      return Promise.resolve({ data: mockCatBreeds });
    });

    const res = await request(app)
      .get('/api/pets/breeds')
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ name: 'Labrador', type: 'dog' });
    expect(res.body[1]).toMatchObject({ name: 'Persian', type: 'cat' });
  });
});

describe('POST /api/pets/create', () => {
  it('should create a new pet', async () => {
    const petData = {
      name: 'Max',
      age: 3,
      breed: 'Labrador'
    };

    const res = await request(app)
      .post('/api/pets/create')
      .send(petData)
      .expect(201);

    expect(res.body).toMatchObject(petData);
    expect(res.body.owner.toString()).toBe(userId.toString());
  });
});

describe('GET /api/pets/user', () => {
  it('should get all user pets', async () => {
    await Pet.create([
      { name: 'Max', age: 3, breed: 'Labrador', owner: userId },
      { name: 'Luna', age: 2, breed: 'Persian', owner: userId }
    ]);

    const res = await request(app)
      .get('/api/pets/user')
      .expect(200);

    expect(res.body).toHaveLength(2);
  });
});

describe('PUT /api/pets/:id', () => {
  it('should update pet information', async () => {
    const pet = await Pet.create({
      _id: petId,
      name: 'Max',
      age: 3,
      breed: 'Labrador',
      owner: userId
    });

    const res = await request(app)
      .put(`/api/pets/${petId}`)
      .send({ name: 'Luna', age: 3, breed: 'Labrador' })
      .expect(200);

    expect(res.body.name).toBe('Luna');
  });

  it('should return 404 for non-existent pet', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    await request(app)
      .put(`/api/pets/${nonExistentId}`)
      .send({ name: 'Luna', age: 3, breed: 'Labrador' })
      .expect(404);
  });
});

describe('POST /api/pets/:id/weight', () => {
  it('should add weight record', async () => {
    const pet = await Pet.create({
      _id: petId,
      name: 'Max',
      age: 3,
      breed: 'Labrador',
      owner: userId
    });

    const res = await request(app)
      .post(`/api/pets/${petId}/weight`)
      .send({ weight: 10.5 })
      .expect(200);

    expect(res.body.weightTrend).toHaveLength(1);
    expect(res.body.weightTrend[0].weight).toBe(10.5);
  });
});

describe('POST /api/pets/:id/vaccination', () => {
  it('should add vaccination record', async () => {
    const pet = await Pet.create({
      _id: petId,
      name: 'Max',
      age: 3,
      breed: 'Labrador',
      owner: userId
    });

    const res = await request(app)
      .post(`/api/pets/${petId}/vaccination`)
      .send({
        vaccine: 'Rabies',
        date: '2024-01-01'
      })
      .expect(200);

    expect(res.body.vaccinationHistory).toHaveLength(1);
    expect(res.body.vaccinationHistory[0].vaccine).toBe('Rabies');
  });
});

describe('DELETE /api/pets/:petId/weight/:recordId', () => {
  it('should delete weight record', async () => {
    const pet = await Pet.create({
      _id: petId,
      name: 'Max',
      age: 3,
      breed: 'Labrador',
      owner: userId,
      weightTrend: [{ weight: 10.5, date: new Date() }]
    });

    const recordId = pet.weightTrend[0]._id;

    const res = await request(app)
      .delete(`/api/pets/${petId}/weight/${recordId}`)
      .expect(200);

    expect(res.body.weightTrend).toHaveLength(0);
  });
});

describe('POST /api/pets/:id/profile-image', () => {
    let mockBucket;
    
    beforeEach(() => {
      const mockStream = new Writable({
        write(chunk, encoding, callback) {
          callback();
        }
      });
  
      mockStream.on = jest.fn((event, callback) => {
        if (event === 'finish') {
          callback();
        }
        return mockStream;
      });
  
      mockBucket = {
        openUploadStreamWithId: jest.fn().mockReturnValue(mockStream),
        delete: jest.fn().mockResolvedValue(true)
      };
  
      getBucket.mockReturnValue(mockBucket);
    });
  
    it('should upload pet profile image', async () => {
      await Pet.create({
        _id: petId,
        name: 'Max',
        age: 3,
        breed: 'Labrador',
        owner: userId
      });
  
      const res = await request(app)
        .post(`/api/pets/${petId}/profile-image`)
        .attach('profileImage', Buffer.from('fake-image'), 'pet.jpg')
        .expect(200);
  
      expect(res.body.message).toBe('Profile image uploaded successfully');
      expect(mockBucket.openUploadStreamWithId).toHaveBeenCalled();
    });
  
    it('should handle missing file', async () => {
      await Pet.create({
        _id: petId,
        name: 'Max',
        age: 3,
        breed: 'Labrador',
        owner: userId
      });
  
      await request(app)
        .post(`/api/pets/${petId}/profile-image`)
        .expect(400);
    });
  });

describe('GET /api/pets/search', () => {
  beforeEach(async () => {
    await Pet.create([
      { name: 'Max', age: 3, breed: 'Labrador', owner: userId },
      { name: 'Luna', age: 2, breed: 'Persian', owner: userId }
    ]);
  });

  it('should search pets by name', async () => {
    const res = await request(app)
      .get('/api/pets/search?name=Max')
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Max');
  });

  it('should search pets by breed', async () => {
    const res = await request(app)
      .get('/api/pets/search?breed=Persian')
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].breed).toBe('Persian');
  });
});