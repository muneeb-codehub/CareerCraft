import mongoose from 'mongoose';

const weeklyTrackerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    resumeProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    skillGapProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    interviewProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    roadmapProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    portfolioProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalTasksCompleted: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Compound index to ensure one entry per user per week per year
weeklyTrackerSchema.index({ user: 1, week: 1, year: 1 }, { unique: true });

const WeeklyTracker = mongoose.model('WeeklyTracker', weeklyTrackerSchema);

export default WeeklyTracker;