const jwt = require("jsonwebtoken");
const expressAsyncHandler = require('express-async-handler');
const ApiError = require("../utils/ApiError");

// Middleware to authenticate requests
const authenticate = expressAsyncHandler(async (req, res, next) => {
    // Get token from cookies
    let token = req.cookies?.token;

    if(!token) throw new ApiError(401, 'No token provided'); 
    
    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if(error.name === "TokenExpiredError") {
            throw new ApiError(401, "Session expired. Please log in again.");
        } else if(error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid or expired token. Please log in again.");
        } else {
            throw new ApiError(401, "Authentication failed."); 
        }
    }
    
    // Verify token
        // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        //     if (err) {
        //         return next(new Error('Invalid token')); // Use error handler
        //     }
        //     req.user = decoded;
        //     next();
        // });
});

// Middleware to check admin role
const isAdmin = expressAsyncHandler(async (req, res, next) => {
    if(!req.user) {
        throw new ApiError(401, "User not authenticated");
    }
    if(req.user.role !=='Admin') {
        throw new Error('Admin access required'); 
    }
    next();
});

module.exports = { authenticate, isAdmin };