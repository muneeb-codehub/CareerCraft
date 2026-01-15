import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db.js";
import { limiter } from './middlewares/rateLimiter.js';
import { setupSwagger } from './config/swagger.js';
import { performanceMiddleware } from './utils/performanceMonitor.js';
import testRoutes from "./routes/test.js";
import auth2Routes from "./routes/auth2.js";
import userRoutes from "./routes/user.js";
import resumeRoutes from "./routes/resume.js";
import skillGapRoutes from "./routes/skillgap.js";
import interviewRoutes from "./routes/interview.js";
import roadmapRoutes from "./routes/roadmap.js";
import portfolioRoutes from "./routes/portfolio.js";
import weeklyTrackerRoutes from "./routes/weeklyTracker.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// Performance monitoring (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(performanceMiddleware);
}

app.use(express.json());
// Configure CORS
app.use(cors({
    origin: ['http://localhost:5175', 'http://localhost:5174', 'http://localhost:5173'], // All possible Vite ports
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply rate limiting to all requests
app.use(limiter);

// Setup Swagger documentation
setupSwagger(app);

// Adding request in logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount routes
app.use("/api/test", testRoutes);
app.use("/api/auth2", auth2Routes);
app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/skillgap", skillGapRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/weekly-tracker", weeklyTrackerRoutes);
app.use("/api/admin", adminRoutes);

console.log("Routes loaded successfully");

// 404 Handler
app.set('trust proxy', 1);
app.use((req, res, next) => {
    console.log(`404 - Not Found: ${req.method} ${req.url}`);
    res.status(404).json({
        success: false,
        message: `Route ${req.url} not found`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        });
    } else {
        // Production mode: don't leak error details
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.isOperational ? err.message : 'Something went wrong!'
        });
    }
});

const PORT = process.env.PORT || 5000;

// Initialize Redis (optional - app will continue without it)
// Uncomment the lines below if you want to enable Redis caching
// import { initRedis } from './config/redis.js';
// initRedis().catch(err => {
//     console.warn('⚠️  Redis not available:', err.message);
// });

// Connect to MongoDB and start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
        console.log('═'.repeat(50));
    });
}).catch(err => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});