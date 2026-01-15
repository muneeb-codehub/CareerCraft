// Input: Resume (PDF/DOCX) + Target Role
// Process:
// - Extracts text from resume
// - Analyzes formatting
// - Checks ATS compatibility
// - Scores different sections
// Output:
// - ATS Score (0-100)
// - Formatting suggestions
// - Missing keywords
// - Improvement suggestions

import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
    // Linking to User model
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },

    // Resume title
    title: {
        type: String,
        required: [true, "Resume title is required"],
        trim: true,
        minlength: [3, "Title must be at least 3 characters long"], // Will change it further
        maxlength: [100, "Title cannot exceed 100 characters"]
    },

    // Resume content
    content: {
        type: String,
        required: [true, "Resume content is required"],
        trim: true,
        minlength: [3, "Resume content must be at least 100 characters long"]
    },

    // AI Suggestions
    aiSuggestions: {
        formatting: [{
            type: String,
            trim: true
        }],
        keywords: [{
            type: String,
            trim: true
        }],
        improvements: [{
            type: String,
            trim: true
        }],
        atsScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: null
        }
    },

    // File path (optional, for file uploads)
    filePath: {
        type: String,
        trim: true,
        default: null
    },

    // Resume Status
    status: {
        type: String,
        enum: ["draft", "submitted", "reviewed", "enhanced"],
        default: "draft"
    },

    // Source of resume
    source: {
        type: String,
        enum: ["upload", "form"],
        required: true
    },

    // Original file details (for uploaded resumes)
    originalFile: {
        name: { type: String },
        type: { type: String }, // pdf/docx
        size: { type: Number }
    },

    // Form data (for form-filled resumes)
    formData: {
        personalInfo: {
            name: String,
            email: String,
            phone: String,
            location: String
        },
        education: [{
            degree: String,
            institution: String,
            year: String,
            details: String
        }],
        experience: [{
            title: String,
            company: String,
            duration: String,
            details: String
        }],
        skills: [String],
        additionalInfo: String
    },

    // Export preferences
    exportFormat: {
        type: String,
        enum: ["pdf", "docx"],
        default: "pdf"
    },

    // Metadata for tracking
    lastAnalyzedAt: {
        type: Date,
        default: null
    }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true
});

// Indexes for better query performance
resumeSchema.index({ userId: 1, status: 1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

// Virtual field for time since last analysis
resumeSchema.virtual("timeSinceLastAnalysis").get(function() {
    if (!this.lastAnalyzedAt) return "Never analyzed";
    return Date.now() - this.lastAnalyzedAt;
});

// Pre-save middleware to trim whitespace from content
resumeSchema.pre("save", function(next) {
    if (this.content) {
        this.content = this.content.trim();
    }
    next();
});

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;

//  Mean ke jo maine last login kiya tha uske andr jo bi api post karu ga,
//  wo us user ke token se resume access ho gi, mean ke jo b login kare ga,
//  wo phir resume post karega, phir baad usko apne JWT token se access mily gi,
//  jo uske andr post ho gi

// Exactly! System exactly aise hi work karta hai:

// Example scenario:

// User A (e.g., Muneeb):

// Login karta hai → Token A milta hai
// Is token se resume upload karta hai → Resume ka owner User A ban jata hai
// Token A se sirf apne (User A ke) resumes dekh/edit kar sakta hai
// User B (e.g., Faiqa):

// Login karti hai → Token B milti hai
// Is token se resume upload karti hai → Resume ka owner User B ban jati hai
// Token B se sirf apne (User B ke) resumes dekh/edit kar sakti hai
// Agar:

// User A, User B ke resume ko access karne ki koshish kare → Error
// User B, User A ke resume ko access karne ki koshish kare → Error
// Koi bina token ke resume access karne ki koshish kare → Error