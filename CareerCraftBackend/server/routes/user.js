import express from "express";
import { protect } from "../middlewares/auth3.js";
import { getUserProfile, updateUserProfile } from "../controllers/user.js";
import { getUserActivities, createActivity, updateActivity } from "../controllers/activity.js";

const router = express.Router();

// route   GET /api/user/profile
// desc    Get user profile
// access  Private
router.get("/profile", protect, getUserProfile);

// route   PUT /api/user/profile
// desc    Update user profile
// access  Private
router.put("/profile", protect, updateUserProfile);

// route   GET /api/user/activities
// desc    Get user activities
// access  Private
router.get("/activities", protect, getUserActivities);

// route   POST /api/user/activities
// desc    Create new activity
// access  Private
router.post("/activities", protect, createActivity);

// route   PUT /api/user/activities/:id
// desc    Update activity status
// access  Private
router.put("/activities/:id", protect, updateActivity);

export default router;


// Authentication routes (auth2.js) - Done
// Protected user routes (user.js) - Done
// JWT middleware (auth3.js) implemented hai 
// User routes index.js mein add ho gaye hain 
// Protected routes implement ho gaye hain:
// GET /api/user/profile (user ki profile get karne ke liye) 
// PUT /api/user/profile (user ki profile update karne ke liye)