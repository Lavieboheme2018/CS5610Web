// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;