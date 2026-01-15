import { updateActivityStatus } from '../utils/activityHelper.js';

/**
 * Middleware to automatically track user activities
 * Usage: Add this middleware after protect middleware in routes
 */
export const trackActivity = (actionName) => {
    return async (req, res, next) => {
        try {
            // Update activity in background (don't wait for it)
            if (req.user && req.user._id) {
                updateActivityStatus(req.user._id, actionName)
                    .catch(err => console.error('Activity tracking error:', err));
            }
            next();
        } catch (error) {
            // Don't block the request if activity tracking fails
            console.error('Activity tracking middleware error:', error);
            next();
        }
    };
};
