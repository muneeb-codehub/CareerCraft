import express from 'express';
import {
    generateRoadmap,
    getRoadmapById,
    getUserRoadmaps,
    updateRoadmapProgress,
    deleteRoadmap
} from '../controllers/roadmap.js';
import { protect } from '../middlewares/auth3.js';
import { trackActivity } from '../middlewares/activityTracker.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate new career roadmap
router.post('/generate', trackActivity('Career roadmaps'), generateRoadmap);

// Get specific roadmap details
router.get('/:id', getRoadmapById);

// Get user's roadmap history
router.get('/user/history', getUserRoadmaps);

// Update roadmap progress
router.put('/:id/update', updateRoadmapProgress);

// Delete roadmap
router.delete('/:id', deleteRoadmap);

export default router;