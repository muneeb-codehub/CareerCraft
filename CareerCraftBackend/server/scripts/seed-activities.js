import mongoose from 'mongoose';
import Activity from './models/Activity.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedActivities = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find first user (you can change this to your user's email)
        const user = await User.findOne();
        
        if (!user) {
            console.log('❌ No user found. Please create a user first.');
            process.exit(1);
        }

        console.log(`📝 Creating activities for user: ${user.email}`);

        // Delete existing activities for this user
        await Activity.deleteMany({ user: user._id });
        console.log('🗑️  Cleared old activities');

        // Create sample activities with different times
        const now = new Date();
        const activities = [
            {
                user: user._id,
                action: 'Resume Building',
                status: 'completed',
                createdAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
                updatedAt: new Date(now - 2 * 60 * 60 * 1000)
            },
            {
                user: user._id,
                action: 'Interview simulation',
                status: 'completed',
                createdAt: new Date(now - 5 * 60 * 60 * 1000), // 5 hours ago
                updatedAt: new Date(now - 5 * 60 * 60 * 1000)
            },
            {
                user: user._id,
                action: 'Skills gap analysis',
                status: 'completed',
                createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000), // 1 day ago
                updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
            },
            {
                user: user._id,
                action: 'Career roadmaps',
                status: 'completed',
                createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
            }
        ];

        await Activity.insertMany(activities);
        console.log(`✅ Created ${activities.length} activities`);

        // Verify
        const count = await Activity.countDocuments({ user: user._id });
        console.log(`📊 Total activities for user: ${count}`);

        await mongoose.connection.close();
        console.log('👋 Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedActivities();
