import mongoose from 'mongoose';
import Activity from './models/Activity.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDuplicateActivities = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all activities
        const activities = await Activity.find().sort({ user: 1, action: 1, status: 1, createdAt: -1 });
        console.log(`📊 Total activities: ${activities.length}`);

        let removed = 0;
        const seen = new Map();

        for (const activity of activities) {
            const key = `${activity.user}_${activity.action}_${activity.status}`;
            
            if (seen.has(key)) {
                // Duplicate found - keep the latest one (already sorted by createdAt desc)
                await Activity.findByIdAndDelete(activity._id);
                removed++;
                console.log(`🗑️  Removed duplicate: ${activity.action} (${activity.status})`);
            } else {
                seen.set(key, activity._id);
            }
        }

        console.log(`\n✅ Cleanup complete! Removed ${removed} duplicate activities`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

cleanupDuplicateActivities();
