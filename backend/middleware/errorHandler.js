const ApiError = require("../utils/ApiError");
// Global error handling middleware
const errorHandler = (err, req, res) => {
  // Log the error stack trace for debugging
  console.error(err);

  // Initialize default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } 

  // Handle Mongoose invalid ObjectId errors
  if (err.name === 'CastError') {
    statusCode = 400; // Bad Request
    message = `Invalid ${err.path}: ${err.value}`;
  } 
  
  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    statusCode = 400; // Bad Request
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // Send JSON response
  res.status(statusCode).json({
    success: false, // Indicate error status
    code: statusCode,
    message, // Error message
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack, // Include stack trace in development
  });
};

module.exports = errorHandler;