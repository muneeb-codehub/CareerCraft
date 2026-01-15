import mongoose from 'mongoose';
import Portfolio from '../models/Portfolio.js';
import Resume from '../models/Resume.js';
import CareerRoadmap from '../models/CareerRoadmap.js';
import SkillGap from '../models/SkillGap.js';
import InterviewSimulator from '../models/InterviewSimulator.js';

/**
 * Get portfolio summary
 * @route GET /api/portfolio/summary
 */
export const getPortfolioSummary = async(req, res) => {
    try {
        // Find all user data first
        const resumes = await Resume.find({ userId: req.user._id });
        const roadmaps = await CareerRoadmap.find({ userId: req.user._id });
        const skillGaps = await SkillGap.find({ userId: req.user._id });
        const interviews = await InterviewSimulator.find({ userId: req.user._id });

        // Find or create portfolio
        let portfolio = await Portfolio.findOne({ userId: req.user._id });

        if (!portfolio) {
            // Create new portfolio with existing data
            portfolio = new Portfolio({
                userId: req.user._id,
                resumes: resumes.map(r => r._id),
                roadmaps: roadmaps.map(r => r._id),
                skillGaps: skillGaps.map(s => s._id),
                interviews: interviews.map(i => i._id),
                goals: [],
                achievements: []
            });
            await portfolio.save();
        } else {
            // Update with any new data
            portfolio.resumes = resumes.map(r => r._id);
            portfolio.roadmaps = roadmaps.map(r => r._id);
            portfolio.skillGaps = skillGaps.map(s => s._id);
            portfolio.interviews = interviews.map(i => i._id);
            await portfolio.save();
        }

        // Reload with all populated fields
        portfolio = await Portfolio.findById(portfolio._id)
            .populate({
                path: 'resumes',
                select: 'title updatedAt score status'
            })
            .populate({
                path: 'roadmaps',
                select: 'targetCareer progress status milestones'
            })
            .populate({
                path: 'skillGaps',
                select: 'targetRole missingSkills improvementAreas'
            });
        // Calculate stats
        const completedMilestones = portfolio.roadmaps.reduce((total, roadmap) => {
            return total + (roadmap.milestones || []).filter(m => m.status === 'completed').length;
        }, 0);

        const totalMilestones = portfolio.roadmaps.reduce((total, roadmap) => {
            return total + (roadmap.milestones || []).length;
        }, 0);

        const completedGoals = portfolio.goals.filter(g => g.status === 'completed').length;
        const totalGoals = portfolio.goals.length;

        // Calculate overall progress considering both goals and roadmap milestones
        const overallProgress = totalGoals + totalMilestones > 0 ?
            Math.round(((completedGoals + completedMilestones) / (totalGoals + totalMilestones)) * 100) :
            0;

        const stats = {
            totalResumes: portfolio.resumes.length,
            activeRoadmaps: portfolio.roadmaps.filter(r => r.status === 'active').length,
            goals: {
                total: totalGoals,
                completed: completedGoals,
                fromPortfolio: portfolio.goals.length,
                fromRoadmap: {
                    total: totalMilestones,
                    completed: completedMilestones
                }
            },
            achievements: {
                total: portfolio.achievements.length,
                fromRoadmap: portfolio.achievements.filter(a => a.category === 'certification').length,
                recent: portfolio.achievements.slice(-3).map(a => ({
                    title: a.title,
                    date: a.date,
                    category: a.category
                }))
            },
            // Completed Goals = Completed Milestones + Completed Portfolio Goals
            // Completed Milestones: When you mark a roadmap milestone as "completed"
            // Completed Portfolio Goals: When you mark a portfolio goal as "completed"
            // Achievements: Are automatically created when:
            // A roadmap milestone is completed (automatically creates an achievement)
            // Can also be manually added for special accomplishments
            //-------------------------------------------------------------------------
            overallProgress: overallProgress
        };

        res.status(200).json({
            success: true,
            data: {
                stats,
                goals: portfolio.goals || [],
                recentResumes: portfolio.resumes.slice(0, 3).map(resume => ({
                    id: resume._id,
                    title: resume.title,
                    score: resume.score,
                    updatedAt: resume.updatedAt,
                    status: resume.status
                })),
                activeRoadmap: portfolio.roadmaps.find(r => r.status === 'active'),
                activeRoadmaps: portfolio.roadmaps
                    .filter(r => r.status === 'active')
                    .map(roadmap => ({
                        id: roadmap._id,
                        targetCareer: roadmap.targetCareer,
                        progress: roadmap.progress,
                        milestones: roadmap.milestones
                    })),
                recentAchievements: portfolio.achievements.slice(0, 3)
            }
        });

    } catch (error) {
        console.error('Error fetching portfolio summary:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching portfolio summary',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Get detailed portfolio
 * @route GET /api/portfolio/detailed
 */
export const getDetailedPortfolio = async(req, res) => {
    try {
        // Find all user data first
        const resumes = await Resume.find({ userId: req.user._id });
        const roadmaps = await CareerRoadmap.find({ userId: req.user._id });
        const skillGaps = await SkillGap.find({ userId: req.user._id });
        const interviews = await InterviewSimulator.find({ userId: req.user._id });

        let portfolio = await Portfolio.findOne({ userId: req.user._id });

        if (!portfolio) {
            // If portfolio doesn't exist, create one with all references
            portfolio = new Portfolio({
                userId: req.user._id,
                resumes: resumes.map(r => r._id),
                roadmaps: roadmaps.map(r => r._id),
                skillGaps: skillGaps.map(s => s._id),
                interviews: interviews.map(i => i._id),
                goals: [],
                achievements: []
            });
            await portfolio.save();
        } else {
            // Update with any new data
            portfolio.resumes = resumes.map(r => r._id);
            portfolio.roadmaps = roadmaps.map(r => r._id);
            portfolio.skillGaps = skillGaps.map(s => s._id);
            portfolio.interviews = interviews.map(i => i._id);
            await portfolio.save();
        }

        // Reload with all populated fields
        portfolio = await Portfolio.findById(portfolio._id)
            .populate('resumes')
            .populate('interviews')
            .populate('skillGaps')
            .populate('roadmaps');

        res.status(200).json({
            success: true,
            data: portfolio
        });

    } catch (error) {
        console.error('Error fetching detailed portfolio:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching detailed portfolio',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Convert completed roadmap milestones to achievements
 * @param {Object} roadmap - The roadmap with completed milestones
 * @returns {Array} Array of achievement objects
 */
const createAchievementsFromRoadmap = (roadmap) => {
    return roadmap.milestones
        .filter(m => m.status === 'completed')
        .map(milestone => ({
            title: `Completed: ${milestone.title}`,
            description: `Completed milestone in career roadmap for ${roadmap.targetCareer}: ${milestone.description}`,
            date: milestone.completionDate || new Date(),
            category: 'certification',
            verified: true
        }));
};

/**
 * Update portfolio goals
 * @route PUT /api/portfolio/goals
 */
export const updateGoals = async(req, res) => {
    try {
        const { goals } = req.body;

        // Find user's roadmaps to sync achievements
        const roadmaps = await CareerRoadmap.find({ userId: req.user._id });

        // Generate achievements from completed roadmap milestones
        const roadmapAchievements = roadmaps.flatMap(createAchievementsFromRoadmap);

        let portfolio = await Portfolio.findOne({ userId: req.user._id });

        if (!portfolio) {
            portfolio = new Portfolio({
                userId: req.user._id,
                goals: goals,
                achievements: roadmapAchievements
            });
        } else {
            portfolio.goals = goals;

            // Add new achievements without duplicates
            const existingTitles = portfolio.achievements.map(a => a.title);
            const newAchievements = roadmapAchievements.filter(
                a => !existingTitles.includes(a.title)
            );
            portfolio.achievements.push(...newAchievements);
        }

        // Update progress based on completed goals and achievements
        portfolio.progress = ((portfolio.goals.filter(g => g.status === 'completed').length / portfolio.goals.length) * 100) || 0;

        await portfolio.save();

        res.status(200).json({
            success: true,
            data: portfolio
        });

    } catch (error) {
        console.error('Error updating portfolio goals:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating portfolio goals',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};