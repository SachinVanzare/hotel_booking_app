const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const expressAsyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

// Get rooms for a hotel
exports.getRooms = expressAsyncHandler(async (req, res) => {
        const hotelId = req.params.hotelId;

        if(!hotelId == Room.hotelId) throw new ApiError(400, 'Hotel ID required');

        // Check if hotel exists
        const hotel = await Hotel.findById(hotelId);
        if(!hotel) throw new ApiError(404, 'Hotel not found');

        // Find available rooms for the hotel
        const rooms = await Room.find({ hotelId, isAvailable: true });
        if(!rooms.length) throw new ApiError(404, 'No available rooms found for this hotel');

        res.status(200).json({ success: true, data: rooms })
});