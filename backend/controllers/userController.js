const User = require("../models/User");
const bcrypt = require('bcryptjs');
const Booking = require('../models/Booking');
const AuditLog = require("../models/AuditLog");
const expressAsyncHandler = require('express-async-handler');
const ApiError = require("../utils/ApiError");

exports.getMe = expressAsyncHandler(async (req, res) => {

        const user = await User.findById(req.user.id).select('-password');
        if(!user || !user.isActive) {
            throw new ApiError(404, 'Account not found or deactivated');
        }
        res.status(200).json({ success: true, data: { id: user._id, username: user.username, email: user.email, role: user.role } });
});

exports.updateUser = expressAsyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        const updateData = {};
        
        // Only update fields provided in the request
        if(username) updateData.username = username;
        if(email) updateData.email = email;
        if(password) updateData.password = await bcrypt.hash(password, 10);

        const user = await User.findByIdAndUpdate(
            { _id: req.user.id, isActive: true}, 
            { $set: updateData },
            { new: true, runValidators: true, select: '-password' }
        );
        if(!user) throw new ApiError(404, 'User not found');
        res.status(200).json({ success: true, message: 'User Details Updated', data: { id: user._id, username: user.username, email: user.email, role: user.role } });
});

exports.deleteUser = expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.user.id);
        if(!user) throw new ApiError(404, 'User not found');
        
        if(user.role == 'Admin') {
            throw new ApiError(403, 'Admins cannot deactivate their own account');
        }

        // Soft delete: set isActive to false, anonymize email, remove password
        await User.findByIdAndUpdate(req.user.id, {
            isActive: false,
            email: `deleted_${user._id}@gmail.com`, // Anonymize email
            password: null,
            deletedAt: new Date(),
        });

        // Log account deletion
        await AuditLog.create({
            userId: req.user.id,
            action: 'Account Deleted',
            details: { username: user.username },
        });

        // Clear authentication cookie
        res.clearCookie('token');

        res.status(200).json({ success: true, message: 'User account Deleted/Deactivated' });
});

exports.getUserHistory = expressAsyncHandler(async (req, res) => {
        const booking = await Booking.find({ userId: req.user.id })
        .populate("hotelId", "name location")
        .populate("roomId", "type price");

        res.status(200).json({ success: true, data: booking });
});