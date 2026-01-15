import InterviewSimulator from '../models/InterviewSimulator.js';
import { generateInterviewQuestions, evaluateAnswer } from '../utils/openai.js';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination.js';

/**
 * Generate new interview questions
 * @route POST /api/interview/generate
 */
export const generateInterview = async(req, res) => {
    try {
        const { jobRole, difficulty } = req.body;

        if (!jobRole) {
            return res.status(400).json({
                success: false,
                message: 'Job role is required'
            });
        }

        // Validate difficulty
        const validDifficulties = ['easy', 'medium', 'hard'];
        const selectedDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'medium';

        // Get user's previous interviews for this job role to avoid duplicate questions
        const previousInterviews = await InterviewSimulator.find({
            userId: req.user._id,
            jobRole: { $regex: new RegExp(jobRole, 'i') } // Case-insensitive match
        }).limit(5).sort({ createdAt: -1 });

        // Extract previously asked questions
        const previousQuestions = previousInterviews.flatMap(interview => 
            interview.questions.map(q => q.question)
        );

        // Generate questions using OpenAI with difficulty and previous questions context
        const questions = await generateInterviewQuestions(
            jobRole, 
            selectedDifficulty,
            previousQuestions
        );

        // Create new interview session
        const interview = new InterviewSimulator({
            userId: req.user._id,
            jobRole,
            difficulty: selectedDifficulty,
            questions,
            status: 'pending'
        });

        await interview.save();

        res.status(201).json({
            success: true,
            data: interview
        });

    } catch (error) {
        console.error('Error generating interview:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating interview questions',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Submit and evaluate answers
 * @route POST /api/interview/:id/submit
 */
export const submitAnswer = async(req, res) => {
    try {
        const { answers } = req.body;
        const interviewId = req.params.id;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Answers must be provided as an array'
            });
        }

        const interview = await InterviewSimulator.findOne({
            _id: interviewId,
            userId: req.user._id
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview session not found'
            });
        }

        // Evaluate each answer
        const evaluatedAnswers = await Promise.all(
            answers.map(async(answer) => {
                const question = interview.questions.id(answer.questionId);
                if (!question) {
                    throw new Error(`Question not found: ${answer.questionId}`);
                }

                const evaluation = await evaluateAnswer(
                    question.question,
                    question.idealAnswer,
                    answer.answer
                );

                return {
                    questionId: answer.questionId,
                    answer: answer.answer,
                    feedback: evaluation.feedback,
                    score: evaluation.score
                };
            })
        );

        // Calculate overall score
        const totalScore = evaluatedAnswers.reduce((sum, ans) => sum + ans.score, 0);
        const overallScore = Math.round(totalScore / evaluatedAnswers.length);

        // Update interview with answers and score
        interview.userAnswers = evaluatedAnswers;
        interview.overallScore = overallScore;
        interview.status = 'completed';
        await interview.save();

        res.status(200).json({
            success: true,
            data: {
                overallScore,
                answers: evaluatedAnswers
            }
        });

    } catch (error) {
        console.error('Error submitting answers:', error);
        res.status(500).json({
            success: false,
            message: 'Error evaluating answers',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Get user's interview history (with pagination)
 * @route GET /api/interview/history?page=1&limit=10&sort=-createdAt
 */
export const getInterviewHistory = async(req, res) => {
    try {
        // Get pagination parameters
        const { page, limit, sort, skip } = getPaginationParams(req, {
            page: 1,
            limit: 10,
            sort: '-createdAt'
        });

        // Get total count and paginated data
        const [interviews, total] = await Promise.all([
            InterviewSimulator.find({ userId: req.user._id })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            InterviewSimulator.countDocuments({ userId: req.user._id })
        ]);

        // Build paginated response
        const response = buildPaginationResponse(interviews, page, limit, total);
        
        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching interview history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching interview history',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Get specific interview details
 * @route GET /api/interview/:id
 */
export const getInterviewById = async(req, res) => {
    try {
        const interview = await InterviewSimulator.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview session not found'
            });
        }

        res.status(200).json({
            success: true,
            data: interview
        });

    } catch (error) {
        console.error('Error fetching interview:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching interview details',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};

/**
 * Delete an interview session
 * @route DELETE /api/interview/:id
 */
export const deleteInterview = async (req, res) => {
    try {
        const interview = await InterviewSimulator.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview session not found'
            });
        }

        if (interview.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this interview'
            });
        }

        await InterviewSimulator.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Interview session deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting interview',
            error: error.message
        });
    }
};