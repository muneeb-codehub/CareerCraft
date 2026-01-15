import express from 'express';
import WeeklyTracker from '../models/WeeklyTracker.js';
import Resume from '../models/Resume.js';
import SkillGap from '../models/SkillGap.js';
import InterviewSimulator from '../models/InterviewSimulator.js';
import CareerRoadmap from '../models/CareerRoadmap.js';
import { protect } from '../middlewares/auth3.js';
import { trackActivity } from '../middlewares/activityTracker.js';

const router = express.Router();

// Save weekly progress
router.post('/save', protect, trackActivity('Progress tracking'), async(req, res) => {
    try {
        const { week, year, resumeProgress, skillGapProgress, interviewProgress, roadmapProgress, portfolioProgress, totalTasksCompleted, notes } = req.body;

        // Find existing tracker or create new one
        let tracker = await WeeklyTracker.findOne({
            user: req.user._id,
            week,
            year
        });

        if (tracker) {
            // Update existing tracker
            tracker.resumeProgress = resumeProgress || tracker.resumeProgress;
            tracker.skillGapProgress = skillGapProgress || tracker.skillGapProgress;
            tracker.interviewProgress = interviewProgress || tracker.interviewProgress;
            tracker.roadmapProgress = roadmapProgress || tracker.roadmapProgress;
            tracker.portfolioProgress = portfolioProgress || tracker.portfolioProgress;
            tracker.totalTasksCompleted = totalTasksCompleted || tracker.totalTasksCompleted;
            tracker.notes = notes || tracker.notes;
        } else {
            // Create new tracker
            tracker = new WeeklyTracker({
                user: req.user._id,
                week,
                year,
                resumeProgress,
                skillGapProgress,
                interviewProgress,
                roadmapProgress,
                portfolioProgress,
                totalTasksCompleted,
                notes
            });
        }

        await tracker.save();
        res.status(200).json(tracker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get weekly progress for chart data
router.get('/chart-data', protect, async(req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();

        // Get all user's data
        const resumes = await Resume.find({ userId: req.user._id });
        const skillGaps = await SkillGap.find({ userId: req.user._id });
        const interviews = await InterviewSimulator.find({ userId: req.user._id });
        const roadmaps = await CareerRoadmap.find({ userId: req.user._id });

        // Calculate progress based on existing data
        const resumeProgress = resumes.length > 0 ? Math.min(100, resumes.length * 20) : 0;
        const skillGapProgress = skillGaps.length > 0 ? Math.min(100, skillGaps.length * 25) : 0;
        const interviewProgress = interviews.length > 0 ? Math.min(100, interviews.length * 20) : 0;
        const roadmapProgress = roadmaps.length > 0 ? Math.min(100, roadmaps.length * 25) : 0;

        // Group data by week for chart
        const dataByWeek = {};
        
        // Helper function to get week number
        const getWeekNumber = (date) => {
            const d = new Date(date);
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNo = Math.ceil((((d - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);
            return weekNo;
        };

        // Process all data and group by week
        [...resumes, ...skillGaps, ...interviews, ...roadmaps].forEach(item => {
            const itemDate = new Date(item.createdAt || item.createdDate);
            if (itemDate.getFullYear() === currentYear) {
                const week = getWeekNumber(itemDate);
                if (!dataByWeek[week]) {
                    dataByWeek[week] = {
                        week,
                        resumeCount: 0,
                        skillGapCount: 0,
                        interviewCount: 0,
                        roadmapCount: 0
                    };
                }
                
                if (resumes.some(r => r._id.toString() === item._id.toString())) {
                    dataByWeek[week].resumeCount++;
                }
                if (skillGaps.some(s => s._id.toString() === item._id.toString())) {
                    dataByWeek[week].skillGapCount++;
                }
                if (interviews.some(i => i._id.toString() === item._id.toString())) {
                    dataByWeek[week].interviewCount++;
                }
                if (roadmaps.some(r => r._id.toString() === item._id.toString())) {
                    dataByWeek[week].roadmapCount++;
                }
            }
        });

        // Convert to sorted array
        const weeks = Object.keys(dataByWeek).sort((a, b) => a - b);
        
        // Calculate cumulative progress
        let cumulativeResume = 0, cumulativeSkillGap = 0, cumulativeInterview = 0, cumulativeRoadmap = 0;
        
        const labels = [];
        const resumeData = [];
        const skillGapData = [];
        const interviewData = [];
        const roadmapData = [];

        weeks.forEach(week => {
            const weekData = dataByWeek[week];
            cumulativeResume = Math.min(100, cumulativeResume + weekData.resumeCount * 20);
            cumulativeSkillGap = Math.min(100, cumulativeSkillGap + weekData.skillGapCount * 25);
            cumulativeInterview = Math.min(100, cumulativeInterview + weekData.interviewCount * 20);
            cumulativeRoadmap = Math.min(100, cumulativeRoadmap + weekData.roadmapCount * 25);

            labels.push(`Week ${week}`);
            resumeData.push(cumulativeResume);
            skillGapData.push(cumulativeSkillGap);
            interviewData.push(cumulativeInterview);
            roadmapData.push(cumulativeRoadmap);
        });

        // If no weekly data, show current totals
        if (labels.length === 0) {
            labels.push('Current');
            resumeData.push(resumeProgress);
            skillGapData.push(skillGapProgress);
            interviewData.push(interviewProgress);
            roadmapData.push(roadmapProgress);
        }

        // Format data for charts
        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Resume Progress',
                    data: resumeData
                },
                {
                    label: 'Skill Gap Progress',
                    data: skillGapData
                },
                {
                    label: 'Interview Progress',
                    data: interviewData
                },
                {
                    label: 'Roadmap Progress',
                    data: roadmapData
                }
            ],
            totalTasks: resumes.length + skillGaps.length + interviews.length + roadmaps.length
        };

        res.status(200).json(chartData);
    } catch (error) {
        console.error('Chart data error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get specific week's progress
router.get('/:week/:year', protect, async(req, res) => {
    try {
        const { week, year } = req.params;

        const tracker = await WeeklyTracker.findOne({
            user: req.user._id,
            week: parseInt(week),
            year: parseInt(year)
        });

        if (!tracker) {
            return res.status(404).json({ message: 'No progress data found for this week' });
        }

        res.status(200).json(tracker);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;