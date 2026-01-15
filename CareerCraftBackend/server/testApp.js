// testApp.js - Express app configuration for testing (without starting server)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import routes
import auth2Routes from './routes/auth2.js';
import resumeRoutes from './routes/resume.js';
import skillGapRoutes from './routes/skillgap.js';
import interviewRoutes from './routes/interview.js';
import roadmapRoutes from './routes/roadmap.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth2', auth2Routes);
app.use('/api/resume', resumeRoutes);
app.use('/api/skillgap', skillGapRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Error handling
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server error'
    });
});

export default app;
