const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const userRoutes = require('../routes/userRoutes');
const auth = require('../middleware/auth');
const { getBucket } = require('../db');

jest.mock('../middleware/auth');
jest.mock('../db');
jest.mock('bcrypt');

let app;
let mongoServer;
const userId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
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
  await User.deleteMany({});
});

describe('GET /api/users/profile', () => {
  it('should get user profile', async () => {
    const user = await User.create({
      _id: userId,
      email: 'test@test.com',
      username: 'testuser',
      password: 'hashedpass'
    });

    const res = await request(app)
      .get('/api/users/profile')
      .expect(200);

    expect(res.body).toMatchObject({
      email: user.email,
      username: user.username
    });
    expect(res.body.password).toBeUndefined();
  });

  it('should return 404 if user not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    auth.mockImplementationOnce((req, res, next) => {
      req.user = { id: nonExistentId.toString() };
      next();
    });

    await request(app)
      .get('/api/users/profile')
      .expect(404);
  });
});

describe('PUT /api/users/profile', () => {
  it('should update user profile', async () => {
    await User.create({
      _id: userId,
      email: 'test@test.com',
      username: 'testuser',
      password: 'hashedpass'
    });

    bcrypt.hash.mockResolvedValue('newhashed');

    const res = await request(app)
      .put('/api/users/profile')
      .send({
        email: 'new@test.com',
        username: 'newuser',
        password: 'newpass'
      })
      .expect(200);

    expect(res.body.user).toMatchObject({
      email: 'new@test.com',
      username: 'newuser'
    });
    expect(res.body.user.password).toBeUndefined();

    const updatedUser = await User.findById(userId);
    expect(updatedUser.password).toBe('newhashed');
  });

  it('should prevent duplicate email', async () => {
    const otherId = new mongoose.Types.ObjectId();
    await User.create({
      _id: otherId,
      email: 'existing@test.com',
      username: 'other',
      password: 'hashedpass'
    });
    
    await User.create({
      _id: userId,
      email: 'test@test.com',
      username: 'testuser',
      password: 'hashedpass'
    });

    await request(app)
      .put('/api/users/profile')
      .send({ email: 'existing@test.com' })
      .expect(400);
  });
});

describe('POST /api/users/profile-image', () => {
  let mockBucket;
  let mockUploadStream;

  beforeEach(() => {
    mockUploadStream = {
      id: new mongoose.Types.ObjectId(),
      write: jest.fn(),
      end: jest.fn(),
      on: jest.fn((event, cb) => {
        if (event === 'finish') setTimeout(cb, 0);
        return mockUploadStream;
      })
    };

    mockBucket = {
      openUploadStream: jest.fn().mockReturnValue(mockUploadStream),
      delete: jest.fn().mockResolvedValue(true)
    };

    getBucket.mockReturnValue(mockBucket);
  });

  it('should upload profile image', async () => {
    await User.create({
      _id: userId,
      email: 'test@test.com',
      username: 'testuser',
      password: 'hashedpass'
    });

    const res = await request(app)
      .post('/api/users/profile-image')
      .attach('profileImage', Buffer.from('fake-image'), 'test.jpg')
      .expect(200);

    expect(res.body.filename).toMatch(/test\.jpg$/);
    expect(mockBucket.openUploadStream).toHaveBeenCalled();
    expect(mockUploadStream.write).toHaveBeenCalled();
    expect(mockUploadStream.end).toHaveBeenCalled();
  });

  it('should handle missing file', async () => {
    await request(app)
      .post('/api/users/profile-image')
      .expect(400);
  });
});

describe('GET /api/users/image/:filename', () => {
  let mockBucket;
  let mockDownloadStream;

  beforeEach(() => {
    mockDownloadStream = {
      pipe: jest.fn((res) => {
        res.end();
        return mockDownloadStream;
      })
    };

    mockBucket = {
      find: jest.fn().mockReturnValue({
        next: jest.fn().mockResolvedValue({ contentType: 'image/jpeg' })
      }),
      openDownloadStreamByName: jest.fn().mockReturnValue(mockDownloadStream)
    };

    getBucket.mockReturnValue(mockBucket);
  });

  it('should stream profile image', async () => {
    await request(app)
      .get('/api/users/image/test.jpg')
      .expect(200);

    expect(mockBucket.find).toHaveBeenCalledWith({ filename: 'test.jpg' });
    expect(mockBucket.openDownloadStreamByName).toHaveBeenCalledWith('test.jpg');
    expect(mockDownloadStream.pipe).toHaveBeenCalled();
  }, 10000);

  it('should return 404 for non-existent image', async () => {
    mockBucket.find.mockReturnValue({
      next: jest.fn().mockResolvedValue(null)
    });

    await request(app)
      .get('/api/users/image/nonexistent.jpg')
      .expect(404);
  });
});

describe('DELETE /api/users/profile-image', () => {
  let mockBucket;

  beforeEach(() => {
    mockBucket = {
      delete: jest.fn().mockResolvedValue(true)
    };
    getBucket.mockReturnValue(mockBucket);
  });

  it('should delete profile image', async () => {
    const fileId = new mongoose.Types.ObjectId();
    await User.create({
      _id: userId,
      email: 'test@test.com',
      username: 'testuser',
      password: 'hashedpass',
      profileImage: {
        fileId: fileId,
        filename: 'test.jpg'
      }
    });

    await request(app)
      .delete('/api/users/profile-image')
      .expect(200);

    const user = await User.findById(userId);
    expect(user.profileImage.fileId).toBeNull();
    expect(user.profileImage.filename).toBeNull();
    expect(mockBucket.delete).toHaveBeenCalledWith(expect.any(mongoose.Types.ObjectId));
  });

  it('should return 404 if no image exists', async () => {
    await User.create({
      _id: userId,
      email: 'test@test.com',
      username: 'testuser',
      password: 'hashedpass',
      profileImage: {
        fileId: null,
        filename: null
      }
    });

    await request(app)
      .delete('/api/users/profile-image')
      .expect(404);
  });
});