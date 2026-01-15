import { openai } from './openai.js';

// Analyze skill gap between user's current skills and desired job role
const analyzeSkillGap = async(currentSkills, targetRole) => {
    try {
        const prompt = `
            As a career advisor, analyze the skill gap between the candidate's current skills and the requirements for their target role.
            
            Current Skills:
            ${currentSkills}
            
            Target Role:
            ${targetRole}
            
            Please provide:
            1. Missing Critical Skills
            2. Skill Level Analysis
            3. Recommended Learning Path
            4. Estimated Time to Bridge Gap
            
            Format the response as a JSON object with these keys:
            {
                "missingSkills": [],
                "skillAnalysis": {},
                "learningPath": [],
                "timeEstimate": ""
            }
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            max_tokens: 1000
        });

        // Parse the response to ensure it's valid JSON
        const response = JSON.parse(completion.choices[0].message.content.trim());

        return {
            success: true,
            data: response
        };

    } catch (error) {
        console.error('Skill Gap Analysis Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to analyze skill gap'
        };
    }
};

// Generate learning recommendations based on skill gap
const generateRecommendations = async(skillGapData) => {
    try {
        const prompt = `
            Based on this skill gap analysis:
            ${JSON.stringify(skillGapData)}
            
            Provide detailed learning recommendations including:
            1. Online courses
            2. Practice projects
            3. Certifications
            4. Learning resources
            
            Format as JSON:
            {
                "courses": [],
                "projects": [],
                "certifications": [],
                "resources": []
            }
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            max_tokens: 1000
        });

        const recommendations = JSON.parse(completion.choices[0].message.content.trim());

        return {
            success: true,
            data: recommendations
        };

    } catch (error) {
        console.error('Recommendations Generation Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate recommendations'
        };
    }
};

// Create a progress tracking plan
const createProgressPlan = async(skillGapData, recommendations) => {
    try {
        const prompt = `
            Create a structured learning plan based on:
            Skill Gap: ${JSON.stringify(skillGapData)}
            Recommendations: ${JSON.stringify(recommendations)}
            
            Include:
            1. Weekly milestones
            2. Progress metrics
            3. Assessment criteria
            
            Format as JSON:
            {
                "weeklyMilestones": [],
                "progressMetrics": {},
                "assessmentCriteria": []
            }
        `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            max_tokens: 1000
        });

        const progressPlan = JSON.parse(completion.choices[0].message.content.trim());

        return {
            success: true,
            data: progressPlan
        };

    } catch (error) {
        console.error('Progress Plan Creation Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to create progress plan'
        };
    }
};

export {
    analyzeSkillGap,
    generateRecommendations,
    createProgressPlan
};