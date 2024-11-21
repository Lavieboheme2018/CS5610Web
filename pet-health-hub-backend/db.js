// db.js
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
let bucket;

async function connectDB() {
  try {
    const conn = await mongoose.connect(uri);
    console.log("Connected to MongoDB with Mongoose");
    
    // Initialize bucket
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    
    return conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

function getBucket() {
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
  }
  return bucket;
}

module.exports = { connectDB, getBucket };