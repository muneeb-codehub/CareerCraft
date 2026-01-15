import mongoose from "mongoose";

const careerRoadmapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentSkills: [{
        type: String,
        required: true
    }],
    targetCareer: {
        type: String,
        required: true,
        trim: true
    },
    milestones: [{
        title: {
            type: String,
            required: true
        },
        timeframe: {
            start: {
                type: Number, // Months from start
                required: true
            },
            end: {
                type: Number, // Months from start
                required: true
            }
        },
        requiredSkills: [{
            skill: {
                type: String,
                required: true
            },
            proficiencyLevel: {
                type: String,
                enum: ['basic', 'intermediate', 'advanced', 'expert'],
                required: true
            }
        }],
        resources: [{
            title: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['course', 'book', 'article', 'video', 'documentation', 'project', 'certification', 'practice', 'tutorial', 'tool', 'other'],
                required: true
            },
            url: String,
            estimatedTimeInHours: Number,
            priority: {
                type: String,
                enum: ['high', 'medium', 'low'],
                default: 'medium'
            }
        }],
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending'
        }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    industryInsights: [{
        topic: String,
        description: String,
        relevance: String
    }]
}, {
    timestamps: true
});

export default mongoose.model('CareerRoadmap', careerRoadmapSchema);