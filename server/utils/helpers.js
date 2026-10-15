const jwt = require('jsonwebtoken');

// Wraps async route handlers so errors go to the error middleware
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Creates a JWT that stores the user's id, valid for 7 days
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Makes user search text safe to use inside a RegExp
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { asyncHandler, generateToken, escapeRegex };
