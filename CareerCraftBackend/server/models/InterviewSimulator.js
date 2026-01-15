import mongoose from "mongoose";

const interviewSimulatorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobRole: {
        type: String,
        required: true,
        trim: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    questions: [{
        question: {
            type: String,
            required: true
        },
        idealAnswer: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true
        },
        category: {
            type: String,
            enum: ['technical', 'behavioral', 'problem-solving'],
            required: true
        },
        scoreWeight: {
            type: Number,
            default: 1,
            min: 0,
            max: 5
        }
    }],
    userAnswers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        feedback: {
            type: String
        },
        score: {
            type: Number,
            min: 0,
            max: 100
        }
    }],
    overallScore: {
        type: Number,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.model('InterviewSimulator', interviewSimulatorSchema);