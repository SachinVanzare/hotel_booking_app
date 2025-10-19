const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

// Define booking routes
router.post('/', authenticate, bookingController.createBooking);
router.put('/confirm/:id', authenticate, bookingController.confirmBooking);
router.put('/cancel/:id', authenticate, bookingController.cancelBooking);

module.exports = router;