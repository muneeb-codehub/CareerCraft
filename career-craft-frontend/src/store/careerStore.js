// src/store/careerStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCareerStore = create(
    persist(
        (set, get) => ({
            // Career Goal State
            careerGoal: null,
            targetRole: '',
            experienceLevel: '',
            targetIndustry: '',
            timeframe: '',

            // Progress Tracking
            profileCompletion: 0,
            weeklyProgress: {
                tasksCompleted: 0,
                totalTasks: 0,
                skillsImproved: 0,
                hoursSpent: 0
            },

            // Resume & Skills
            resumeStatus: 'not_uploaded', // not_uploaded, uploaded, analyzed
            skillGaps: [],
            strengths: [],

            // Interview & Learning
            interviewsCompleted: 0,
            coursesInProgress: [],
            certificationsEarned: [],

            // Actions
            setCareerGoal: (goalData) => {
                set({
                    careerGoal: goalData,
                    targetRole: goalData.targetRole || '',
                    experienceLevel: goalData.experienceLevel || '',
                    targetIndustry: goalData.targetIndustry || '',
                    timeframe: goalData.timeframe || ''
                });
            },

            updateProfileCompletion: (percentage) => {
                set({ profileCompletion: percentage });
            },

            updateWeeklyProgress: (progressData) => {
                set({
                    weeklyProgress: {
                        ...get().weeklyProgress,
                        ...progressData
                    }
                });
            },

            setResumeStatus: (status) => {
                set({ resumeStatus: status });
            },

            updateSkillAnalysis: (skillGaps, strengths) => {
                set({ skillGaps, strengths });
            },

            incrementInterviews: () => {
                set({ interviewsCompleted: get().interviewsCompleted + 1 });
            },

            addCourse: (course) => {
                set({
                    coursesInProgress: [...get().coursesInProgress, course]
                });
            },

            completeCourse: (courseId) => {
                const courses = get().coursesInProgress.filter(course => course.id !== courseId);
                set({ coursesInProgress: courses });
            },

            addCertification: (certification) => {
                set({
                    certificationsEarned: [...get().certificationsEarned, certification]
                });
            },

            // Calculate overall progress
            getOverallProgress: () => {
                const state = get();
                let progress = 0;

                // Profile completion (30%)
                progress += (state.profileCompletion / 100) * 30;

                // Career goal set (20%)
                if (state.careerGoal) progress += 20;

                // Resume uploaded (15%)
                if (state.resumeStatus !== 'not_uploaded') progress += 15;

                // Skills analysis (15%)
                if (state.skillGaps.length > 0) progress += 15;

                // Interview practice (10%)
                if (state.interviewsCompleted > 0) progress += 10;

                // Courses/Certifications (10%)
                if (state.coursesInProgress.length > 0 || state.certificationsEarned.length > 0) progress += 10;

                return Math.min(progress, 100);
            },

            // Get career insights
            getCareerInsights: () => {
                const state = get();
                const insights = [];

                // Always show these recommendations if conditions not met
                if (!state.careerGoal) {
                    insights.push({
                        type: 'action',
                        message: 'Start by building your professional resume using our AI-powered Resume Builder',
                        priority: 'high'
                    });
                }

                if (state.resumeStatus === 'not_uploaded') {
                    insights.push({
                        type: 'action',
                        message: 'Identify your skill gaps with our comprehensive Skill Gap Analysis tool',
                        priority: 'high'
                    });
                }

                insights.push({
                    type: 'practice',
                    message: 'Practice mock interviews to boost your confidence and performance',
                    priority: 'medium'
                });

                insights.push({
                    type: 'tip',
                    message: 'Get a personalized career roadmap tailored to your goals and experience',
                    priority: 'medium'
                });

                insights.push({
                    type: 'action',
                    message: 'Track your progress and achievements in your Portfolio',
                    priority: 'low'
                });

                // Additional insights based on progress
                if (state.skillGaps.length > 0) {
                    insights.push({
                        type: 'tip',
                        message: `Focus on improving ${state.skillGaps.slice(0, 2).join(', ')} skills for faster career growth`,
                        priority: 'medium'
                    });
                }

                if (state.interviewsCompleted > 0 && state.interviewsCompleted < 5) {
                    insights.push({
                        type: 'practice',
                        message: `You've completed ${state.interviewsCompleted} interviews. Keep practicing to master your interview skills`,
                        priority: 'medium'
                    });
                }

                return insights;
            },

            // Reset all career data
            resetCareerData: () => {
                set({
                    careerGoal: null,
                    targetRole: '',
                    experienceLevel: '',
                    targetIndustry: '',
                    timeframe: '',
                    profileCompletion: 0,
                    weeklyProgress: {
                        tasksCompleted: 0,
                        totalTasks: 0,
                        skillsImproved: 0,
                        hoursSpent: 0
                    },
                    resumeStatus: 'not_uploaded',
                    skillGaps: [],
                    strengths: [],
                    interviewsCompleted: 0,
                    coursesInProgress: [],
                    certificationsEarned: []
                });
            }
        }), {
            name: 'career-storage',
            partialize: (state) => ({
                careerGoal: state.careerGoal,
                targetRole: state.targetRole,
                experienceLevel: state.experienceLevel,
                targetIndustry: state.targetIndustry,
                timeframe: state.timeframe,
                profileCompletion: state.profileCompletion,
                weeklyProgress: state.weeklyProgress,
                resumeStatus: state.resumeStatus,
                skillGaps: state.skillGaps,
                strengths: state.strengths,
                interviewsCompleted: state.interviewsCompleted,
                coursesInProgress: state.coursesInProgress,
                certificationsEarned: state.certificationsEarned
            })
        }
    )
);

export default useCareerStore;