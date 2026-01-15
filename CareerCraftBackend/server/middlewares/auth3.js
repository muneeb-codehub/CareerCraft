import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protecting routes - JWT verification middleware
export const protect = async(req, res, next) => {
    try {
        // Get token from header (supporting both formats)
        const token = (req.header('Authorization') && req.header('Authorization').replace('Bearer ', '')) ||
            (req.headers.authorization && req.headers.authorization.split(" ")[1]);

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database (without password)
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({ message: "Your account has been blocked. Please contact admin." });
        }

        // Setting user in request object
        req.user = user;
        next();

    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Token is not valid" });
    }
};

// Admin middleware - Protects admin routes
export const adminProtect = async(req, res, next) => {
    try {
        // First verify token and get user using protect middleware
        await protect(req, res, async() => {
            // Check if user is admin
            if (!req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin rights required"
                });
            }
            next();
        });
    } catch (error) {
        console.error("Admin authorization error:", error);
        return res.status(401).json({ message: "Not authorized as admin" });
    }
};

// JWT token system generated hota hai:
// Jab user login karta hai
// Server automatically generate karta hai token
// Har user ka unique token hota hai
// Token expire ho jata hai kuch time baad (usually 15 days, 30 days etc.)
// Token ka purpose:
// Ye sirf temporary authentication ke liye hai
// Jaise aap Facebook/Gmail me login karte ho:
// Pehli baar email/password dalte ho
// Fir browser me session/token save ho jata hai
// Agli baar automatically logged in rehte ho
// Browser band karke kholo to fir se login karna padta hai
// Security:
// Token me sensitive info nahi hoti
// Sirf user ki ID aur expiry time hota hai
// Server ke JWT_SECRET se sign hota hai
// Koi modify nahi kar sakta token ko
// User ko yaad rakhna hai sirf:
// Email
// Password
// Baki sab automated hai:

// User login karta hai (email/password se)
// Server token generate karta hai
// Frontend (browser/app) token save kar leta hai
// Har request me automatically token bhej deta hai
// Token expire hone pe system fir se login mangta hai
// So admin ko bhi kuch store nahi karna padta. Ye pure system automated hai security ke liye.


// System ka kaam:

// Token generate karna (login pe)
// Token verify karna (har request pe)
// Token expire karna (15 days, 30 days baad)
// Security maintain karna

// User ka kaam sirf:

// Email/password yaad rakhna
// Login karna
// Bass!

// Admin ka kaam:

// System ka JWT_SECRET set karna (.env file me)
// Baki kuch nahi
// Real life example se samjhein:

// Jaise movie theater me:
// Aap ticket khareedte ho (login)
// Theater ticket deta hai (JWT token)
// Har gate pe ticket dikhate ho (token verification)
// Show khatam, ticket expire (token expiry)
// Agli movie ke liye nayi ticket (new login, new token)
// User ko pata bhi nahi chalta ke backend me ye sab ho raha hai,
// just like movie ticket holder ko nahi pata hota ticket ke security features ke bare me!