const mongoose = require('mongoose');

// Define the Room schema
const roomSchema = new mongoose.Schema({
    hotelId : { type : mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    type : { type : String, required : true },
    price : { type : Number, required : true },
    hourlyPrice: { type: Number, default: 0 },
    maxGuests: { type: Number, required: true },
    isAvailable  : { type : Boolean, required: true, default : true },
}, { timestamps: true });

// Create index for faster queries by hotelId
roomSchema.index({ hotelId: 1 });

module.exports = mongoose.model('Room', roomSchema);