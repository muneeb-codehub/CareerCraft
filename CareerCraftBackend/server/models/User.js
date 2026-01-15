import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// bcrypt.js ek JavaScript library hai jo passwords ko securely hash (encrypt)
// karne ke liye use hoti hai taake agar database leak bhi ho jaye,
// tou real passwords kisi ko na mil sakein

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        maxlength: [20, "Name cannot exceed 20 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false // Will not include password in queries by default
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Hash password before saving (secret-text)
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;


// Lines 4-8: Name field validation
// Required field
// Max 15 characters
// Trim whitespace
// Lines 9-16: Email field validation
// Required, unique
// Lowercase conversion
// Email regex validation
// Trim whitespace
// Lines 17-22: Password field
// Required, min 8 characters
// select: false (password hidden by default)
// Lines 25-35: Password hashing (pre-save hook)
// Automatically hashes password before saving
// Uses bcrypt with salt 10
// Lines 38-40: Password comparison method
// For login verification

// Without bcrypt:
//{
//   "email": "muneeb@gmail.com",
//   "password": "muneeb123"
// }
// Agar database leak ho gaya — Then hacker can access the passwords directly

// With bcrypt:
// {
//   "email": "muneeb@gmail.com",
//   "password": "$2a$10$E6KtxIBsC9ljFzV..." (Hashed)
// }