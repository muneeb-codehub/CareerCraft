import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendLoginNotification, sendWelcomeEmail } from "../utils/emailService.js";
import { createDefaultActivities } from "../utils/activityHelper.js";

// Generating JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15d" // 15 days expiry
    });
};

// User ki ID se JWT token banaega, jo 15 din ke liye valid rahega (30 days bhi kar sakte if I want to)
// ----------------------------------------------------------------------

// Register user
// route   POST /api/auth/signup
// access  Public
export const signup = async(req, res) => {
    try {
        const { name, email, password } = req.body;

        // Checking if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Creates new user
        const user = await User.create({
            name,
            email,
            password,
            isAdmin: req.body.isAdmin || false
        });

        // Generate token
        const token = generateToken(user._id);

        // Create default pending activities for new user
        createDefaultActivities(user._id)
            .catch(err => console.error('Failed to create default activities:', err));

        // Send welcome email with password (non-blocking)
        sendWelcomeEmail(user.email, user.name, password)
            .catch(err => console.error('Failed to send welcome email:', err));

        // Will Return the user data (without password) and token - NO auto login
        res.status(201).json({
            success: true,
            message: "Registration successful! Please check your email for login credentials.",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                },
                requireLogin: true // Flag to indicate user needs to login
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        // Handling validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error during signup"
        });
    }
};

// 1. Request body se name, email, password nikalta hai
// 2. Check karta hai ke user already exist toh nahi (email se)
// 3. Password ko hash karta hai (model ke pre-save hook se)
// 4. Naya user DB mein save karta hai
// 5. JWT token generate karta hai
// 6. User data + token response mein bhejta hai
// 7. Validation aur server errors handle karta hai
// ----------------------------------------------------------------------

// desc    Login user
// route   POST /api/auth/login
// access  Public
export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Send login notification email with password
        const loginTime = new Date().toLocaleString('en-US', { 
            dateStyle: 'full', 
            timeStyle: 'long' 
        });
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';
        
        // Send email notification with password (non-blocking)
        sendLoginNotification(user.email, user.name, loginTime, ipAddress, password)
            .catch(err => console.error('Failed to send login notification:', err));

        // Return user data and token
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

// 1. Email se user find karta hai (password field bhi laata hai)
// 2. Password ko bcrypt se compare karta hai
// 3. Agar match ho jaye toh JWT token generate karta hai
// 4. User data + token response mein bhejta hai
// 5. Invalid credentials ya server errors handle karta hai
// ----------------------------------------------------------------------

// desc    Get current user
// route   GET /api/auth/me
// access  Private
export const getMe = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 1. JWT middleware se req.user.id milta hai
// 2. Us id se user DB se find karta hai
// 3. User data response mein bhejta hai
// 4. Agar user na mile toh error return karta hai
// ----------------------------------------------------------------------

// Login Flow:
// User Login Request:
// User apna email aur password bhejta hai (frontend ya Postman se).
// Backend Kya Karta Hai:
// Email se user ko database (MongoDB) mein search karta hai.
// Password ko compare karta hai (hashed password se).
// Agar match ho jaye, JWT token generate karta hai aur user data + token wapas bhejta hai.
// Database Mein Kya Hota Hai:
// Kuch bhi naya save nahi hota.
// Sirf user ki details read hoti hain, koi update ya insert nahi hota.

// Summary:
// Signup: User ka data database mein save hota hai.
// Login: Sirf verify hota hai, database mein kuch bhi naya add/update nahi hota.
// JWT Token: Sirf response mein frontend ko diya jata hai, database mein nahi save hota.

// genSalt(10)	Generates random salt	Protects from rainbow tables
// hash(password, salt)	Converts plain password to hash	Safe to store in DB