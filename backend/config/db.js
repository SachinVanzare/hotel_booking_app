// Import mongoose for MongoDB connection
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI from .env
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected!!!');
    } catch (error) {
        console.error('MongoDB Connection Error : ',error);
        process.exit(1); // Exit process on failure 
    }
};

module.exports = connectDB;