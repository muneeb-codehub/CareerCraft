import express from 'express';
import {
    generateInterview,
    submitAnswer,
    getInterviewHistory,
    getInterviewById,
    deleteInterview
} from '../controllers/interview.js';
import { protect } from '../middlewares/auth3.js';
import { trackActivity } from '../middlewares/activityTracker.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate new interview questions for a job role
router.post('/generate', trackActivity('Interview simulation'), generateInterview);

// Submit answers for evaluation
router.post('/:id/submit', submitAnswer);

// Get user's interview history
router.get('/history', getInterviewHistory);

// Get specific interview details
router.get('/:id', getInterviewById);

// Delete interview session
router.delete('/:id', deleteInterview);

export default router;