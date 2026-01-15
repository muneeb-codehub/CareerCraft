import mongoose from "mongoose";

const connectDB = async() => {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...');
        console.log('📍 URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            family: 4,
            directConnection: false,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
        // Enable query logging in development
        if (process.env.NODE_ENV === 'development') {
            mongoose.set('debug', true);
        }
        
        // Monitor connection events
        mongoose.connection.on('connected', () => {
            console.log('✅ Mongoose connected to MongoDB');
        });
        
        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  Mongoose disconnected from MongoDB');
        });
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;