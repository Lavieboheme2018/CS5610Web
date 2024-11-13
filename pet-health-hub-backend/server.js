// server.js
const express = require('express');
const connectDB = require('./db'); // MongoDB connection
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Connect to MongoDB
connectDB();

// Import and use routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');

// Route definitions
app.use('/api/auth', authRoutes);       // Authentication routes (register, login)
app.use('/api/users', userRoutes);       // User-related routes
app.use('/api/pets', petRoutes);         // Pet-related routes

// Server Port Configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});