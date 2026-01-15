// backend/config/multer.js
import multer from 'multer';
import path from 'path';

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
    resume: 5 * 1024 * 1024,      // 5MB for resumes
    portfolio: 10 * 1024 * 1024,  // 10MB for portfolio files
    default: 5 * 1024 * 1024      // 5MB default
};

// Use in-memory storage so file stays in buffer (not saved to disk)
const storage = multer.memoryStorage();

// File filter — only allow PDF or DOCX
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword' // For older .doc files
    ];

    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and DOCX files are allowed! Received: ' + file.mimetype), false);
    }
};

// Configure upload with enhanced limits
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.resume, // 5MB limit for resumes
        files: 1 // Only one file at a time
    }
});

// Portfolio upload with higher limit
export const portfolioUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.portfolio, // 10MB for portfolio
        files: 5 // Allow multiple files for portfolio
    }
});

// Error handler middleware for multer errors
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size is ${FILE_SIZE_LIMITS.resume / (1024 * 1024)}MB`,
                error: 'FILE_TOO_LARGE'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files uploaded',
                error: 'TOO_MANY_FILES'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field',
                error: 'UNEXPECTED_FILE'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
            error: 'UPLOAD_ERROR'
        });
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed',
            error: 'UPLOAD_ERROR'
        });
    }
    
    next();
};

export default upload;
