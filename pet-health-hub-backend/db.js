// db.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri); 
    console.log("Connected to MongoDB with Mongoose");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

module.exports = connectDB;