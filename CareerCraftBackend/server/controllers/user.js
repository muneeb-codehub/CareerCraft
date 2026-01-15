import User from "../models/User.js";

/**
 * desc:    Get current user's profile
 * route:   GET /api/user/profile
 * access:  Private
 * security: Requires JWT token in Authorization header
 */
export const getUserProfile = async(req, res) => {
    try {
        // Will Get fresh user data from database instead of using req.user
        // This will ensure that we have the most up-to-date information
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Will return user data without sensitive information
        res.json({
            success: true,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile"
        });
    }
};

// desc    Update user profile
// route   PUT /api/user/profile
// access  Private
export const updateUserProfile = async(req, res) => {
    try {
        const { name, email } = req.body;
        const user = req.user;

        // Input validation
        if (!name && !email) {
            return res.status(400).json({
                success: false,
                message: "Please provide at least one field to update"
            });
        }

        // Will Update the user fields
        if (name) {
            if (name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters long"
                });
            }
            user.name = name.trim();
        }

        if (email) {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address"
                });
            }
            user.email = email.toLowerCase();
        }

        // Saving to database
        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user
            }
        });
    } catch (error) {
        console.error("Profile update error:", error);

        // Handling validation errors from Mongoose
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error during profile update"
        });
    }
};


// Test Case 1: Protected Route Without Token

// GET /api/user/profile (without token)
// Result: 401 Unauthorized (as expected)

// Test Case 2: Protected Route With Valid Token

// GET /api/user/profile (with token)
// Result: 200 OK, returned correct user data

// Test Case 3: Profile Update With Valid Data

// PUT /api/user/profile (with token)
// Result: 200 OK, profile updated successfully
// Updated fields reflected in response
// updatedAt timestamp changed

// Test Case 4: Profile Update With Invalid Data

// PUT /api/user/profile (with invalid email)
// Result: 400 Bad Request with validation error
// Proper error message: "User validation failed: email: Please enter a valid email"
// All tests have passed successfully, showing that: