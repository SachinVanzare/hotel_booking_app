// const { default: mongoose } = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const expressAsyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

// Create booking
exports.createBooking = expressAsyncHandler(async (req, res, next) => {
  const { roomId, checkIn, checkOut, guests } = req.body;
  const session = await mongoose.startSession();
  let booking;
  try {
    await session.withTransaction(async () => {
      // Validate room exists and is available
      const room = await Room.findOne({ _id: roomId, isAvailable: true }).session(session);
      if (!room) throw new ApiError(404, "Room not available");

      if (guests > room.maxGuests) {
        throw new ApiError(400, `Maximum ${room.maxGuests} guests allowed for this room`);
      }

      // Calculate total price (simplified: price * nights)
      const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
      if (nights <= 0) throw new ApiError(400, "Check-out must be after check-in");

      const totalPrice = room.price * nights;

      // Create booking inside transaction
      booking = new Booking({
        userId: req.user.id,
        hotelId: room.hotelId,
        roomId,
        checkIn,
        checkOut,
        guests,
        totalPrice,
        status: "pending",
      });
      await booking.save({ session });
      console.log("Booking model:", booking);

      await Room.updateOne({ _id: roomId },{ $set: { isAvailable: false } },{ session });
    });
    res.status(201).json({ success: true, message: "Booking Created", data: booking });

    } catch (error) {
      next(error);
    } finally {
      session.endSession();
    }

  });

exports.confirmBooking = expressAsyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.status !== "pending") {
    throw new ApiError(400, "Cannot confirm this booking");
  }
  if (booking.userId.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized");
  }
  booking.status = "confirmed";
  await booking.save();
  res
    .status(200)
    .json({ success: true, message: "Booking confirmed", data: booking });
});

exports.cancelBooking = expressAsyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.status === "cancelled") throw new ApiError(400, "Already cancelled");
  
  if (!booking.userId || booking.userId.toString() !== req.user.id) {
    throw new ApiError(403, "Unauthorized");
  }
  booking.status = "cancelled";
  await Room.findByIdAndUpdate(booking.roomId, { isAvailable: true });
  await booking.save();
  res
    .status(200)
    .json({ success: true, message: "Booking cancelled", data: booking });
});
