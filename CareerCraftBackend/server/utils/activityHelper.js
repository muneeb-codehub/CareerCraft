import Activity from '../models/Activity.js';

/**
 * Create default pending activities for new user
 */
export const createDefaultActivities = async (userId) => {
    try {
        const defaultActivities = [
            { user: userId, action: 'Skills gap analysis', status: 'pending' },
            { user: userId, action: 'Resume Building', status: 'pending' },
            { user: userId, action: 'Interview simulation', status: 'pending' },
            { user: userId, action: 'Career roadmaps', status: 'pending' },
            { user: userId, action: 'Portfolio update', status: 'pending' },
            { user: userId, action: 'Progress tracking', status: 'pending' }
        ];

        await Activity.insertMany(defaultActivities);
        console.log(`✅ Created default activities for user: ${userId}`);
    } catch (error) {
        console.error('Error creating default activities:', error);
    }
};

/**
 * Update activity from pending to completed
 */
export const updateActivityStatus = async (userId, actionName) => {
    try {
        // Update ALL pending activities of this type to completed
        const result = await Activity.updateMany(
            { user: userId, action: actionName, status: 'pending' },
            { status: 'completed', updatedAt: new Date() }
        );

        if (result.modifiedCount > 0) {
            console.log(`✅ Updated ${result.modifiedCount} pending activity(ies): ${actionName} for user: ${userId}`);
        } else {
            // If no pending activity found, create a new completed one
            await Activity.create({
                user: userId,
                action: actionName,
                status: 'completed'
            });
            console.log(`✅ Created new activity: ${actionName} for user: ${userId}`);
        }
    } catch (error) {
        console.error('Error updating activity status:', error);
    }
};
