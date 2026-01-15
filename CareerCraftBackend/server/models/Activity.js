import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'Skills gap analysis',
            'Resume Building',
            'Interview simulation',
            'Career roadmaps',
            'Portfolio update',
            'Progress tracking'
        ]
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'in-progress'],
        default: 'pending'
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for faster queries
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
