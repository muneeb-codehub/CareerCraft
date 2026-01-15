import express from 'express';
import User from '../models/User.js';
import { adminProtect } from '../middlewares/auth3.js';
import AppError from '../utils/errorHandler.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', adminProtect, async(req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user (admin only)
router.delete('/users/:userId', adminProtect, async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            throw new AppError('Admin cannot delete their own account', 400);
        }

        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Toggle user block status (admin only)
router.patch('/users/:userId/toggle-block', adminProtect, async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from blocking themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Admin cannot block their own account' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            isBlocked: user.isBlocked
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user statistics (admin only)
router.get('/statistics', adminProtect, async(req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const activeUsers = totalUsers - blockedUsers;

        // Get users registered in last 7 days
        const lastWeekUsers = await User.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        res.status(200).json({
            totalUsers,
            activeUsers,
            blockedUsers,
            lastWeekUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;