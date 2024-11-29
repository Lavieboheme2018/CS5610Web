const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');
const dotenv = require('dotenv'); 


dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
      const allowedOrigins = [
          'http://localhost:3000', // Local development
          'https://cs-5610-web-copy.vercel.app', // Deployed Vercel frontend
      ];
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  credentials: true // Allow credentials (e.g., cookies, authentication headers)
}));

app.use(express.json());

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

// Import and use routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');
const petServiceRoutes = require('./routes/petServiceRoutes');

// Route definitions
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api', petServiceRoutes);

module.exports = app;
