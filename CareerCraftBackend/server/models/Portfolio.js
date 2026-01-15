import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        enum: ['certification', 'project', 'award', 'publication', 'other'],
        required: true
    },
    url: String,
    verified: {
        type: Boolean,
        default: false
    }
});

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    targetDate: Date,
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'deferred'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
});

const portfolioSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    resumes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    }],
    interviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InterviewSimulator'
    }],
    skillGaps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkillGap'
    }],
    roadmaps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CareerRoadmap'
    }],
    goals: [goalSchema],
    achievements: [achievementSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to update lastUpdated
portfolioSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

// Virtual for calculating overall portfolio completion
portfolioSchema.virtual('overallProgress').get(function() {
    const totalGoals = this.goals.length;
    if (totalGoals === 0) return 0;

    const completedGoals = this.goals.filter(goal => goal.status === 'completed').length;
    return Math.round((completedGoals / totalGoals) * 100);
});

export default mongoose.model('Portfolio', portfolioSchema);