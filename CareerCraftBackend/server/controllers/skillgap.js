import SkillGap from '../models/SkillGap.js';
import { analyzeSkillGap } from '../utils/openai.js';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination.js';

/**
 * Get all skill gap analyses for a user (with pagination)
 * @route GET /api/skillgap/history?page=1&limit=10&sort=-createdAt
 */
export const getUserAnalysisHistory = async(req, res) => {
    try {
        // Verify if user exists in request
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get pagination parameters
        const { page, limit, sort, skip } = getPaginationParams(req, {
            page: 1,
            limit: 10,
            sort: '-createdAt'
        });

        // Get total count and paginated data
        const [analyses, total] = await Promise.all([
            SkillGap.find({ userId: req.user._id })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            SkillGap.countDocuments({ userId: req.user._id })
        ]);

        // Return empty array if no analyses found
        if (!analyses || analyses.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: limit,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                },
                message: 'No analysis history found'
            });
        }

        // Build paginated response
        const response = buildPaginationResponse(analyses, page, limit, total);
        
        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching analysis history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analysis history',
            error: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : {}
        });
    }
};

/**
 * Create a new skill gap analysis
 * @route POST /api/skillgap/analyze
 */
export const analyzeSkills = async(req, res) => {
    try {
        const { currentRole, experience, skills } = req.body.currentProfile;
        const { targetRole } = req.body;

        // Validation
        if (!currentRole || !experience || !skills || !targetRole) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!Array.isArray(skills)) {
            return res.status(400).json({
                success: false,
                message: 'Skills must be an array'
            });
        }

        if (skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Skills array cannot be empty. Please provide at least one skill.'
            });
        }

        // Validate each skill is not empty
        if (skills.some(skill => !skill || skill.trim() === '')) {
            return res.status(400).json({
                success: false,
                message: 'Skills cannot be empty strings'
            });
        }

        // Create initial record
        const skillGap = new SkillGap({
            userId: req.user._id, // Assuming auth middleware sets req.user
            targetRole,
            currentProfile: {
                skills,
                experience,
                currentRole
            },
            status: 'pending'
        });

        await skillGap.save();

        // Perform analysis
        const analysis = await analyzeSkillGap({
            currentRole,
            experience,
            skills
        }, targetRole);

        // Update record with analysis results
        skillGap.analysis = {
            missingSkills: analysis.missingSkills,
            improvementAreas: analysis.improvementAreas,
            learningPath: analysis.learningPath
        };
        skillGap.overallTimeEstimate = analysis.timeEstimate;
        skillGap.status = 'completed';
        await skillGap.save();

        res.status(200).json({
            success: true,
            data: skillGap
        });

    } catch (error) {
        console.error('Skill Gap Analysis Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing skill gap analysis',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};



/**
 * Get a specific analysis by ID
 * @route GET /api/skillgap/:id
 */
export const getAnalysisById = async(req, res) => {
    try {
        const analysis = await SkillGap.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error('Error fetching analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analysis',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Delete a skill gap analysis
 * @route DELETE /api/skillgap/:id
 */
export const deleteAnalysis = async (req, res) => {
    try {
        const analysis = await SkillGap.findById(req.params.id);

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Analysis not found'
            });
        }

        if (analysis.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this analysis'
            });
        }

        await SkillGap.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Skill gap analysis deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting analysis',
            error: error.message
        });
    }
};