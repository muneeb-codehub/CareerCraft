import express from 'express';
import { getPortfolioSummary, getDetailedPortfolio, updateGoals } from '../controllers/portfolio.js';
import { protect } from '../middlewares/auth3.js';
import { trackActivity } from '../middlewares/activityTracker.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get portfolio summary
router.get('/summary', getPortfolioSummary);

// Get detailed portfolio
router.get('/detailed', getDetailedPortfolio);

// Update portfolio goals
router.put('/goals', trackActivity('Portfolio update'), updateGoals);

export default router;