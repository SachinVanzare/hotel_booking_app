const express = require('express');
const router = express.Router();
const { createUser, updateUser, deleteUser, getUsers, getDeactivatedUsersReport, createHotel, updateHotel, deleteHotel, createRoom, updateRoom, deleteRoom, getDashboardStats } = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/dashboard', authenticate, isAdmin, getDashboardStats);
router.get('/users', authenticate, isAdmin, getUsers); // List active/deactive users
router.post('/users', authenticate, isAdmin, createUser); // Create user
router.put('/users/:id', authenticate, isAdmin, updateUser); // Update user
router.delete('/users/:id', authenticate, isAdmin, deleteUser); // Delete user
router.get('/users/deactivated', authenticate, isAdmin, getDeactivatedUsersReport); // Deactivated users report
router.post('/hotels', authenticate, isAdmin, createHotel); // Create hotel
router.put('/hotels/:id', authenticate, isAdmin, updateHotel); // Update hotel
router.delete('/hotels/:id', authenticate, isAdmin, deleteHotel); // Delete hotel
router.post('/rooms', authenticate, isAdmin, createRoom); // Create room
router.put('/rooms/:id', authenticate, isAdmin, updateRoom); // Update room
router.delete('/rooms/:id', authenticate, isAdmin, deleteRoom); // Delete room

module.exports = router;