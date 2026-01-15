import Activity from "../models/Activity.js";

/**
 * desc:    Get user's recent activities
 * route:   GET /api/user/activities
 * access:  Private
 */
export const getUserActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const activities = await Activity.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('action status createdAt updatedAt');

        res.json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        console.error("Get activities error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching activities"
        });
    }
};

/**
 * desc:    Create new activity
 * route:   POST /api/user/activities
 * access:  Private
 */
export const createActivity = async (req, res) => {
    try {
        const { action, status, description } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Action is required"
            });
        }

        const activity = await Activity.create({
            user: req.user._id,
            action,
            status: status || 'pending',
            description: description || ''
        });

        res.status(201).json({
            success: true,
            message: "Activity created successfully",
            data: activity
        });
    } catch (error) {
        console.error("Create activity error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating activity"
        });
    }
};

/**
 * desc:    Update activity status
 * route:   PUT /api/user/activities/:id
 * access:  Private
 */
export const updateActivity = async (req, res) => {
    try {
        const { status } = req.body;

        const activity = await Activity.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!activity) {
            return res.status(404).json({
                success: false,
                message: "Activity not found"
            });
        }

        if (status) {
            activity.status = status;
        }

        await activity.save();

        res.json({
            success: true,
            message: "Activity updated successfully",
            data: activity
        });
    } catch (error) {
        console.error("Update activity error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating activity"
        });
    }
};
