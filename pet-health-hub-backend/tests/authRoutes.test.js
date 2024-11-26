const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');
const { connectDB } = require('../db');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeAll(async () => {
    await connectDB(); // Connect to the test database
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase(); // Clean up test database
    await mongoose.connection.close(); // Close connection
  });

  beforeEach(async () => {
    await User.deleteMany({}); // Clear users before each test
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).not.toBeNull();
      expect(await bcrypt.compare('password123', user.password)).toBe(true);
    });

    it('should not register a user with an existing email', async () => {
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'newpassword' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Email already in use');
    });

    it('should return a 500 error for server issues', async () => {
      jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'error@example.com', password: 'password123' });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
      });
    });

    it('should log in an existing user and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');

      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
    });

    it('should return a 400 error for incorrect email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'password123' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return a 400 error for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return a 500 error for server issues', async () => {
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  });
});
