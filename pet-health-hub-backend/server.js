// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./db'); // MongoDB connection
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));

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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});