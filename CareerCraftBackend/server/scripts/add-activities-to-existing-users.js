import mongoose from 'mongoose';
import User from './models/User.js';
import { createDefaultActivities } from './utils/activityHelper.js';
import dotenv from 'dotenv';

dotenv.config();

const addActivitiesToExistingUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all users
        const users = await User.find();
        console.log(`📊 Found ${users.length} users`);

        for (const user of users) {
            console.log(`\n👤 Processing user: ${user.email}`);
            await createDefaultActivities(user._id);
        }

        await mongoose.connection.close();
        console.log('\n✅ All done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

addActivitiesToExistingUsers();
