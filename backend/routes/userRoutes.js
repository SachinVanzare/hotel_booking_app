const express = require('express');
const router = express.Router();
const { updateUser, deleteUser, getUserHistory, getMe } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateUser); // Update user details
router.delete('/me', authenticate, deleteUser); // Soft delete user account
router.get('/me/history', authenticate, getUserHistory); // New: Get booking history

module.exports = router;
