// server.js
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Connect to MongoDB
connectDB().then(() => {
  // Import and use routes
  const authRoutes = require('./routes/authRoutes');
  const userRoutes = require('./routes/userRoutes');
  const petRoutes = require('./routes/petRoutes');

  // Route definitions
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/pets', petRoutes);

  // Server Port Configuration
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});