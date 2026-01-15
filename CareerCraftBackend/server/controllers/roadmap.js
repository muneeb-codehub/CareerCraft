import CareerRoadmap from '../models/CareerRoadmap.js';
import { generateCareerRoadmap } from '../utils/openai.js';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination.js';

/**
 * Generate new career roadmap
 * @route POST /api/roadmap/generate
 */
export const generateRoadmap = async(req, res) => {
    try {
        console.log('📍 Roadmap generation request received');
        const { currentSkills, targetCareer, timeframe = 12 } = req.body;
        console.log('📝 Request data:', { currentSkills, targetCareer, timeframe });

        if (!currentSkills || !targetCareer) {
            console.log('❌ Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Current skills and target career are required'
            });
        }

        console.log('🤖 Generating roadmap with AI...');
        // Generate roadmap using OpenAI
        const roadmapData = await generateCareerRoadmap(currentSkills, targetCareer, timeframe);
        console.log('✅ AI roadmap generated successfully');

        // Normalize resource types to match enum values
        const validTypes = ['course', 'book', 'article', 'video', 'documentation', 'project', 'certification', 'practice', 'tutorial', 'tool', 'other'];
        const typeMapping = {
            'practice platform': 'practice',
            'online course': 'course',
            'video tutorial': 'video',
            'youtube video': 'video',
            'blog post': 'article',
            'coding challenge': 'practice',
            'exercise': 'practice',
            'platform': 'tool',
            'website': 'documentation',
            'guide': 'documentation'
        };

        // Clean up milestones resources
        if (roadmapData.milestones) {
            roadmapData.milestones.forEach(milestone => {
                if (milestone.resources) {
                    milestone.resources.forEach(resource => {
                        if (resource.type) {
                            const lowerType = resource.type.toLowerCase().trim();
                            // Check if it's already valid
                            if (!validTypes.includes(lowerType)) {
                                // Try to map it
                                resource.type = typeMapping[lowerType] || 'other';
                            } else {
                                resource.type = lowerType;
                            }
                        }
                    });
                }
            });
        }

        // Calculate initial progress based on current skills
        // If user has some relevant skills, give them some initial progress
        const totalSkillsNeeded = roadmapData.milestones.reduce((total, milestone) => 
            total + milestone.requiredSkills.length, 0
        );
        
        const initialProgress = Math.min(
            Math.round((currentSkills.length / totalSkillsNeeded) * 100), 
            25 // Cap at 25% for initial skills
        );

        // Create new roadmap
        const roadmap = new CareerRoadmap({
            userId: req.user._id,
            currentSkills,
            targetCareer,
            timeframe,
            milestones: roadmapData.milestones,
            industryInsights: roadmapData.industryInsights,
            progress: initialProgress
        });

        console.log('💾 Saving roadmap to database...');
        await roadmap.save();
        console.log('✅ Roadmap saved successfully');

        res.status(201).json({
            success: true,
            data: roadmap
        });

    } catch (error) {
        console.error('❌ Error generating roadmap:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error generating career roadmap',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Get specific roadmap details
 * @route GET /api/roadmap/:id
 */
export const getRoadmapById = async(req, res) => {
    try {
        const roadmap = await CareerRoadmap.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found'
            });
        }

        res.status(200).json({
            success: true,
            data: roadmap
        });

    } catch (error) {
        console.error('Error fetching roadmap:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roadmap details',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Get user's roadmap history (with pagination)
 * @route GET /api/roadmap/history?page=1&limit=10&sort=-createdAt
 */
export const getUserRoadmaps = async(req, res) => {
    try {
        // Get pagination parameters
        const { page, limit, sort, skip } = getPaginationParams(req, {
            page: 1,
            limit: 10,
            sort: '-createdAt'
        });

        // Get total count and paginated data
        const [roadmaps, total] = await Promise.all([
            CareerRoadmap.find({ userId: req.user._id })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            CareerRoadmap.countDocuments({ userId: req.user._id })
        ]);

        // Build paginated response
        const response = buildPaginationResponse(roadmaps, page, limit, total);
        
        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching roadmap history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roadmap history',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Update roadmap progress
 * @route PUT /api/roadmap/:id/update
 */
export const updateRoadmapProgress = async(req, res) => {
    try {
        const { milestoneUpdates } = req.body;

        const roadmap = await CareerRoadmap.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found'
            });
        }

        // Update milestone statuses
        if (milestoneUpdates) {
            milestoneUpdates.forEach(update => {
                const milestone = roadmap.milestones.id(update.milestoneId);
                if (milestone) {
                    milestone.status = update.status;
                }
            });
        }

        // You can also update multiple milestones at once:
        // PUT /api/roadmap/:id/update
        // {
        //     "milestoneUpdates": [
        //         {
        //             "milestoneId": "688de3f5b05738ab1a902649",
        //             "status": "completed"
        //         },
        //         {
        //             "milestoneId": "688de3f5b05738ab1a90264e",
        //             "status": "in-progress"
        //         }
        //     ]
        // }

        // Calculate overall progress
        const completedMilestones = roadmap.milestones.filter(m => m.status === 'completed').length;
        roadmap.progress = (completedMilestones / roadmap.milestones.length) * 100;

        // Update status if all milestones completed
        if (roadmap.progress === 100) {
            roadmap.status = 'completed';
        }

        await roadmap.save();

        res.status(200).json({
            success: true,
            data: roadmap
        });

    } catch (error) {
        console.error('Error updating roadmap:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating roadmap progress',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Delete a career roadmap
 * @route DELETE /api/roadmap/:id
 */
export const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await CareerRoadmap.findById(req.params.id);

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found'
            });
        }

        if (roadmap.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this roadmap'
            });
        }

        await CareerRoadmap.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Roadmap deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting roadmap:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting roadmap',
            error: error.message
        });
    }
};