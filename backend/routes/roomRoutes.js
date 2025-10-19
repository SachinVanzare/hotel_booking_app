const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get('/:hotelId', roomController.getRooms);

module.exports = router;