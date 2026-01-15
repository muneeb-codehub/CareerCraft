// Input: Current Profile (skills/experience) + Target Role
// Process:
// - Analyzes current skill level
// - Compares with role requirements
// - Creates learning roadmap
// - Estimates time needed
// Output:
// - Missing critical skills
// - Areas needing improvement
// - Learning path with resources
// - Time estimates for transition

import mongoose from "mongoose";

const skillGapSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetRole: {
        type: String,
        required: true,
        trim: true
    },
    currentProfile: {
        skills: [{
            type: String,
            trim: true
        }],
        experience: {
            type: String,
            required: true
        },
        currentRole: {
            type: String,
            required: true
        }
    },
    analysis: {
        missingSkills: [{
            skill: String,
            priority: {
                type: String,
                enum: ['critical', 'important', 'nice-to-have']
            },
            description: String
        }],
        improvementAreas: [{
            skill: String,
            currentLevel: String,
            requiredLevel: String,
            recommendations: String
        }],
        learningPath: [{
            skill: String,
            resources: [String],
            estimatedTimeInWeeks: Number,
            priority: String
        }]
    },
    overallTimeEstimate: {
        minimumWeeks: Number,
        maximumWeeks: Number,
        averageWeeks: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

export default mongoose.model('SkillGap', skillGapSchema);

// Main Differences:

// Purpose:

// Resume Analysis: Make resume better for ATS/hiring
// Skill Gap: Create career development plan
// Scope:

// Resume: Document improvement focus
// Skill Gap: Career transition focus
// Output:

// Resume: Quick fixes and improvements
// Skill Gap: Long-term learning plan
// Timeline:

// Resume: Immediate changes needed
// Skill Gap: Weeks/months development plan