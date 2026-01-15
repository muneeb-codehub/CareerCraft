import rateLimit from 'express-rate-limit';
import AppError from '../utils/errorHandler.js';

export const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!',
    handler: (req, res) => {
        throw new AppError('Too many requests from this IP, please try again in an hour!', 429);
    }
});