import express from 'express';
import { analyzeSkills, getUserAnalysisHistory, getAnalysisById, deleteAnalysis } from '../controllers/skillgap.js';
import { protect } from '../middlewares/auth3.js'; // Assuming this is your auth middleware
import { trackActivity } from '../middlewares/activityTracker.js';

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

// Create new analysis
//router.post('/analyze', analyzeSkills);

router.post('/analyze', trackActivity('Skills gap analysis'), analyzeSkills, protect, async(req, res) => {
    try {
        const { currentProfile, targetRole } = req.body;

        // Validate input
        if (!currentProfile || !targetRole) {
            return res.status(400).json({
                success: false,
                message: 'Current profile and target role are required'
            });
        }

        if (!currentProfile.skills || currentProfile.skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one skill is required'
            });
        }

        // Call your OpenAI function from openai.js
        const analysisResult = await analyzeSkillGap(currentProfile, targetRole);

        // Save to database (optional)
        // You can save the analysis result to user's profile
        // await User.findByIdAndUpdate(req.user.id, {
        //     lastSkillAnalysis: analysisResult,
        //     lastAnalysisDate: new Date()
        // });

        res.status(200).json({
            success: true,
            message: 'Skill gap analysis completed successfully',
            data: analysisResult
        });

    } catch (error) {
        console.error('Skill Gap Analysis Error:', error);

        // Handle different types of errors
        if (error.type === 'NetworkError') {
            return res.status(503).json({
                success: false,
                message: 'AI service is temporarily unavailable. Please try again.',
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to analyze skill gap',
            error: error.message
        });
    }
});

// Get analysis history
router.get('/history', getUserAnalysisHistory);

// Get specific analysis
router.get('/:id', getAnalysisById);

// Delete analysis
router.delete('/:id', deleteAnalysis);

export default router;