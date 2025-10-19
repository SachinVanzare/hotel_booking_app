const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const AuditLog = require('../models/AuditLog');
const expressAsyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');

exports.getDashboardStats = expressAsyncHandler(async (req, res) => {
  const stats = {
    users: {
      total: await User.countDocuments(),
      active: await User.countDocuments({ isActive: true }),
      deactivated: await User.countDocuments({ isActive: false }),
    },
    Hotels: await Hotel.countDocuments(),
    rooms: {
      total: await Room.countDocuments(),
      available: await Room.countDocuments({ isAvailable: true }),
    },
    bookings: {
      total: await Booking.countDocuments(),
      pending: await Booking.countDocuments({ status: 'pending' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
    }
  };
  res.status(200).json({success: true,data: stats });
});

exports.getUsers = expressAsyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(200).json({ success: true, data: users });
});

exports.createUser = expressAsyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  if (role && !['User', 'Admin'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, role: role || 'User' });
  await user.save();
  res.status(201).json({ success: true, message: 'User created', data: user });
});

exports.updateUser = expressAsyncHandler(async (req, res) => {
  const { username, email, password, role, isActive } = req.body;
  const updateData = {};
  if (username) updateData.username = username;
  if (email) updateData.email = email;
  if (password) updateData.password = await bcrypt.hash(password, 10);
  if (role) updateData.role = role;
  if (typeof isActive === 'boolean') updateData.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true, select: '-password' });
  if (!user) throw new ApiError(404, 'User not found');

  res.status(200).json({ success: true, message: 'User updated', data: user });
});

exports.deleteUser = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.isActive === false) throw new ApiError(409, 'User already Deleted');

  await User.findByIdAndUpdate(req.params.id, {
    isActive: false,
    email: `deleted_${user._id}@gmail.com`,
    password: null,
    deletedAt: new Date(),
  });

  await AuditLog.create({
    userId: req.params.id,
    action: 'Account_Deleted_by_Admin',
    details: { username: user.username, deletedBy: req.user.id },
  });

  res.status(200).json({ success: true, message: 'User account deactivated' });
});

exports.getDeactivatedUsersReport = expressAsyncHandler(async (req, res) => {
  const deactivatedUsers = await User.find({ isActive: false }).select('username email deletedAt');
  const auditLogs = await AuditLog.find({ action: { $in: ['Account Deleted', 'Account_Deleted_by_Admin'] } })
    .populate('userId', 'username');

  res.status(200).json({ success: true, data: { users: deactivatedUsers, logs: auditLogs } });
});

exports.createHotel = expressAsyncHandler(async (req, res) => {
  const hotel = new Hotel(req.body);
  await hotel.save();
  res.status(201).json({ success: true, message: 'Hotel created', data: hotel });
});

exports.updateHotel = expressAsyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!hotel) throw new ApiError(404, 'Hotel not found');

  res.status(200).json({ success: true, message: 'Hotel updated', data: hotel });
});

exports.deleteHotel = expressAsyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!hotel) throw new ApiError(404, 'Hotel not found');

  await Room.deleteMany({ hotelId: req.params.id });
  res.status(200).json({ success: true, message: 'Hotel deleted' });
});

exports.createRoom = expressAsyncHandler(async (req, res) => {
  const { hotelId, type, price, maxGuests, isAvailable } = req.body;
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) throw new ApiError(404, 'Invalid hotelId. Hotel not found.');

  const room = new Room({ hotelId, type, price, maxGuests, isAvailable: isAvailable ?? true });
  await room.save();

  res.status(201).json({ success: true, message: 'Room created', data: room });
});

exports.updateRoom = expressAsyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!room) throw new ApiError(404, 'Room not found');

  res.status(200).json({ success: true, message: 'Room updated', data: room });
});

exports.deleteRoom = expressAsyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found');

  res.status(200).json({ success: true, message: 'Room deleted' });
});
