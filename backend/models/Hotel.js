const mongoose = require('mongoose');

// Define the Hotel schema
const hotelSchema = new mongoose.Schema({
    name : { type: String, required:true },
    location : { type: String, required:true },
    description : { type: String },
    pricePerNight : { type: Number, required:true },
    images : [{ type: String }],
    amenities : [{ type: String }],
    rating: { type: Number, default: 0 },
}, { timestamps: true });

// Create index for faster search queries
hotelSchema.index({ location: 1, pricePerNight: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
