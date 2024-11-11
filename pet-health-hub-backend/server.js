// server.js
const express = require('express');
const connectDB = require('./db'); // Note that we don’t need to destructure here
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB(); // Connect using Mongoose

// Import routes
const userRoutes = require('./routes/userRoutes');
const petRoutes = require('./routes/petRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});