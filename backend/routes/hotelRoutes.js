const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Define hotel routes
router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelDetails);

module.exports = router;