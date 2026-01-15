import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { jsonrepair } from 'jsonrepair';
dotenv.config();

// Use API key from environment variable
const API_KEY = process.env.GROQ_API_KEY;

// Log for debugging (remove in production)
console.log('Groq API Key exists:', !!API_KEY);
console.log('First few characters of API key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'not found');

if (!API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
}

// Central Groq configuration
const groq = new Groq({
    apiKey: API_KEY
});

function extractJsonFromMarkdown(text) {
    return text.replace(/```json|```/g, '').trim();
}

/**
 * Generic error handler for Groq calls
 * @param {Error} error - The error object
 * @throws {Object} Formatted error object
 */
const handleGroqError = (error) => {
    console.error('Groq Error:', error);

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
        console.error('Network or Timeout Error. Retrying...');
        throw {
            message: 'Request timed out or network error. Please try again.',
            type: 'NetworkError',
            code: error.code || 'TIMEOUT',
            retryable: true
        };
    }

    const errorDetail = {
        message: error.message,
        type: error.type || 'Unknown',
        code: error.code || 'Unknown',
        param: error.param,
        stack: error.stack
    };
    console.log('Detailed Groq Error:', errorDetail);
    throw errorDetail;
};

/**
 * Analyze resume content and get AI suggestions
 * @param {string} content - Resume content
 * @param {string} role - Target role
 * @returns {Promise<Object>} AI suggestions
 */
export const analyzeResume = async(content, role) => {
    try {
        const prompt = `As an expert resume reviewer and career counselor, analyze the following resume for a ${role} position. Be very strict in your analysis.

        Scoring Criteria for ATS (0-100):
        - Professional Summary/Objective (0-10 points)
        - Work Experience with measurable achievements (0-30 points)
        - Education with relevant details (0-15 points)
        - Skills matching the role (0-25 points)
        - Proper formatting and structure (0-10 points)
        - Keywords relevant to ${role} role (0-10 points)

        Resume Content to Analyze:
        ${content}

        Analyze based on above criteria and provide suggestions in these categories:

        Provide the response in JSON format with the following structure:
        {
            "formatting": ["suggestion1", "suggestion2", ...],
            "keywords": ["keyword1", "keyword2", ...],
            "improvements": ["improvement1", "improvement2", ...],
            "atsScore": number
        }`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Best model on Groq
            messages: [{
                    role: "system",
                    content: "You are an expert and strict resume reviewer and career counselor. When providing keywords: They should be written in bullet points and tell the latest and required skills for the role. When providing improvements:\n1. Each suggestion should be highly detailed with 100-150 words\n2. Include specific examples and best practices\n3. Provide actionable steps to implement each suggestion\n4. Include industry-specific recommendations\n5. Never give more than 35% score for incomplete sections.\n\nIMPORTANT: Return ONLY valid JSON. Ensure all strings are properly escaped. Replace newlines with \\n, tabs with \\t, and escape quotes with \\\"."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        // Clean markdown formatting before parsing
        let aiResponse = response.choices[0].message.content;
        console.log('Raw AI Response:', aiResponse.substring(0, 500)); // Log first 500 chars
        
        let cleanJson = extractJsonFromMarkdown(aiResponse);
        
        let suggestions;
        try {
            // First attempt: direct parse
            suggestions = JSON.parse(cleanJson);
        } catch (err) {
            console.log('JSON parse failed, attempting repair...');
            try {
                // Second attempt: use jsonrepair to fix malformed JSON
                const repairedJson = jsonrepair(cleanJson);
                suggestions = JSON.parse(repairedJson);
            } catch (repairErr) {
                console.error('JSON repair also failed:', repairErr);
                console.error('Problematic JSON:', cleanJson);
                throw new Error(`Failed to parse AI response: ${repairErr.message}`);
            }
        }
        
        return suggestions;

    } catch (error) {
        console.error('Groq Analysis Error:', error);
        const errorDetail = {
            message: error.message,
            type: error.type || 'Unknown',
            code: error.code || 'Unknown',
            param: error.param,
            stack: error.stack
        };
        console.log('Detailed Groq Error:', errorDetail);
        throw errorDetail;
    }
};

/**
 * Analyze skill gaps between current profile and target role
 * @param {Object} currentProfile - User's current skills and experience
 * @param {string} targetRole - Desired job role
 * @returns {Promise<Object>} Detailed gap analysis
 */
export const analyzeSkillGap = async(currentProfile, targetRole) => {
    try {
        const validSkills = [
            "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Dart", "Kotlin", "Go", "TypeScript", "Rust", "Scala", "R", "MATLAB", "Perl", "Haskell",
            "HTML", "CSS", "React", "Angular", "Vue.js", "Vue", "Node.js", "NodeJS", "Express.js", "Express", "Django", "Flask", "Laravel", "Spring Boot", "Spring", "ASP.NET", "Next.js", "Nextjs", "Nuxt.js", "Nuxtjs", "Svelte", "Ember.js", "Ember",
            "MongoDB", "Mongo", "MySQL", "PostgreSQL", "Postgres", "SQL", "Oracle", "Redis", "Elasticsearch", "Cassandra", "DynamoDB", "SQLite", "MariaDB", "Neo4j", "CouchDB",
            "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s", "Jenkins", "Git", "GitHub", "GitLab", "CI/CD", "Terraform", "Ansible", "Chef", "Puppet", "Vagrant", "Linux", "Unix",
            "iOS", "Android", "React Native", "Flutter", "Xamarin", "Ionic", "Cordova", "Swift UI", "SwiftUI", "Kotlin Multiplatform",
            "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Sklearn", "Keras", "OpenCV", "NLTK", "Spark", "Hadoop", "Tableau", "Power BI", "PowerBI", "Excel", "Jupyter",
            "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InVision", "Principle", "Framer", "Zeplin", "UI Design", "UX Design", "UX Research", "Wireframing", "Prototyping",
            "Agile", "Scrum", "Kanban", "Jira", "Trello", "Asana", "Slack", "Communication", "Team Leadership", "Leadership", "Project Management", "Problem Solving", "Critical Thinking", "Analytical Skills",
            "Selenium", "Jest", "Cypress", "Mocha", "Jasmine", "Unit Testing", "Integration Testing", "Test Automation", "Manual Testing", "Performance Testing", "QA", "Testing",
            "Digital Marketing", "SEO", "SEM", "Google Analytics", "Facebook Ads", "Content Marketing", "Email Marketing", "Social Media Marketing", "Marketing Automation", "CRM", "Salesforce",
            "REST API", "GraphQL", "API", "Microservices", "Web Development", "Frontend", "Backend", "Full Stack", "DevOps", "Machine Learning", "Deep Learning", "AI", "Data Science", "Cloud"
        ];

        // Normalize skill names for better matching
        const normalizeSkill = (skill) => skill.toLowerCase().replace(/[.\s-]/g, '');

        const invalidSkills = currentProfile.skills.filter(skill => {
            const normalizedSkill = normalizeSkill(skill);
            return !validSkills.some(validSkill => {
                const normalizedValid = normalizeSkill(validSkill);
                return normalizedValid.includes(normalizedSkill) || normalizedSkill.includes(normalizedValid);
            });
        });

        if (invalidSkills.length > 0) {
            console.log('Invalid skills detected:', invalidSkills);
            // Don't throw error, just log warning and continue
            console.warn(`Warning: Unrecognized skills will be processed: ${invalidSkills.join(', ')}`);
        }

        const prompt = `As a senior career counselor and industry expert with deep knowledge of ${targetRole} requirements, conduct a comprehensive skill gap analysis. Be thorough and provide actionable insights. Return ONLY a valid JSON object, no markdown, no explanation, no comments.

        Current Profile:
        - Role: ${currentProfile.currentRole}
        - Experience: ${currentProfile.experience} years
        - Current Skills: ${currentProfile.skills.join(', ')}
        
        Target Role: ${targetRole}

        CRITICAL INSTRUCTIONS FOR TIME ESTIMATES:
        1. Be REALISTIC about learning times based on industry standards
        2. Consider the person already has ${currentProfile.experience} years of experience
        3. Use these realistic timeframes for learning:
           - Basic framework/library (React, Vue): 4-6 weeks with daily 2-3 hours practice
           - Database basics (SQL/MongoDB): 3-4 weeks with daily practice
           - Testing frameworks: 2-3 weeks
           - DevOps basics (Docker, AWS basics): 4-6 weeks
           - Security concepts: 3-4 weeks
           - Advanced topics: 6-8 weeks
           - Soft skills (Agile, Scrum): 1-2 weeks
        4. For someone with experience, learning related skills is FASTER
        5. Total time estimate should be:
           - minimumWeeks: If learning 2-3 hours daily (realistic minimum)
           - averageWeeks: If learning 1-2 hours daily (most common)
           - maximumWeeks: If learning 30-45 mins daily (slow pace)
        6. Don't give inflated estimates - people can learn faster with focused effort
        7. Calculate overall time assuming PARALLEL learning (not sequential)

        Return response in this EXACT JSON format:
        {
            "missingSkills": [
                {
                    "skill": "specific skill name",
                    "priority": "critical/important/nice-to-have",
                    "description": "detailed explanation of why this skill is important"
                }
            ],
            "improvementAreas": [
                {
                    "skill": "skill name from current skills",
                    "currentLevel": "beginner/intermediate/advanced",
                    "requiredLevel": "intermediate/advanced/expert",
                    "recommendations": "specific, actionable steps to improve"
                }
            ],
            "learningPath": [
                {
                    "skill": "skill name",
                    "resources": ["resource 1", "resource 2", "resource 3"],
                    "estimatedTimeInWeeks": number (be realistic - see guidelines above),
                    "priority": "high/medium/low"
                }
            ],
            "timeEstimate": {
                "minimumWeeks": number (intensive learning 2-3hrs/day),
                "maximumWeeks": number (casual learning 30-45mins/day),
                "averageWeeks": number (moderate learning 1-2hrs/day)
            }
        }`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{
                    role: "system",
                    content: `You are a senior career counselor and industry expert specializing in ${targetRole} positions. Provide detailed, realistic, and actionable career advice based on current industry standards. IMPORTANT: Be realistic about learning times. Most skills can be learned in 3-8 weeks with consistent practice. Consider that experienced developers learn faster. Don't give inflated time estimates - focus on achievable, real-world timelines.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000
        });

        let aiResponse = response.choices[0].message.content;
        let cleanJson = extractJsonFromMarkdown(aiResponse);

        let analysis;
        try {
            analysis = JSON.parse(cleanJson);
        } catch (err) {
            analysis = JSON.parse(jsonrepair(cleanJson));
        }

        if (!analysis.missingSkills || !analysis.learningPath || !analysis.timeEstimate) {
            throw new Error('Invalid AI response structure');
        }

        return analysis;

    } catch (error) {
        console.error('Skill Gap Analysis Error:', error);

        if (error.message.includes('Invalid skills detected')) {
            throw error;
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.message.includes('timeout')) {
            throw {
                message: 'AI service request timed out. Please try again.',
                type: 'NetworkError',
                code: error.code || 'TIMEOUT',
                retryable: true
            };
        }

        throw {
            message: error.message || 'Failed to analyze skill gap',
            type: error.type || 'Unknown',
            code: error.code || 'UNKNOWN',
            retryable: false
        };
    }
};

/**
 * Generate interview questions for a specific job role
 * @param {string} jobRole - The target job role
 * @param {string} difficulty - The difficulty level (easy/medium/hard)
 * @param {Array<string>} previousQuestions - Previously asked questions to avoid duplicates
 * @returns {Promise<Array>} Array of interview questions with ideal answers
 */
export const generateInterviewQuestions = async(jobRole, difficulty = 'medium', previousQuestions = []) => {
    try {
        const difficultyMap = {
            easy: { scoreWeight: 3, description: 'basic and fundamental' },
            medium: { scoreWeight: 4, description: 'intermediate level' },
            hard: { scoreWeight: 5, description: 'advanced and challenging' }
        };

        const selectedDifficulty = difficultyMap[difficulty] || difficultyMap.medium;

        // Create a section about avoiding previous questions if they exist
        const avoidDuplicatesSection = previousQuestions.length > 0 
            ? `\n\nCRITICAL - AVOID THESE PREVIOUSLY ASKED QUESTIONS:\n${previousQuestions.slice(0, 10).map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nYou MUST generate completely different questions. Do not repeat or rephrase the above questions.`
            : '';

        const prompt = `As an expert technical interviewer and hiring manager, create a comprehensive interview question set for a ${jobRole} position.

        Generate 5 UNIQUE questions total at ${difficulty.toUpperCase()} difficulty level:
        - 2 Technical questions specific to ${jobRole}
        - 2 Behavioral questions to assess soft skills
        - 1 Problem-solving scenario

        CRITICAL REQUIREMENTS:
        - ALL questions must be at ${difficulty.toUpperCase()} difficulty level (${selectedDifficulty.description})
        - scoreWeight MUST be ${selectedDifficulty.scoreWeight} for ALL questions
        - difficulty MUST be "${difficulty}" for ALL questions
        - Keep questions appropriate for ${difficulty} level candidates
        - Questions must be UNIQUE and NOT similar to previously asked questions${avoidDuplicatesSection}

        Return the response in this exact JSON format:
        {
            "questions": [
                {
                    "question": "detailed question text",
                    "idealAnswer": "comprehensive ideal answer",
                    "difficulty": "${difficulty}",
                    "category": "technical/behavioral/problem-solving",
                    "scoreWeight": ${selectedDifficulty.scoreWeight}
                }
            ]
        }`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{
                    role: "system",
                    content: `You are an expert technical interviewer and hiring manager. Create ${difficulty} level questions that test both technical skills and problem-solving abilities. ALL questions must be at ${difficulty} difficulty level. scoreWeight must be ${selectedDifficulty.scoreWeight} for all questions.`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 3000
        });

        let aiResponse = response.choices[0].message.content;
        let cleanJson = extractJsonFromMarkdown(aiResponse);
        
        let result;
        try {
            result = JSON.parse(cleanJson);
        } catch (err) {
            result = JSON.parse(jsonrepair(cleanJson));
        }
        
        return result.questions;

    } catch (error) {
        return handleGroqError(error);
    }
};

/**
 * Evaluate an interview answer
 * @param {string} question - The interview question
 * @param {string} idealAnswer - The ideal answer to compare against
 * @param {string} userAnswer - The user's answer to evaluate
 * @returns {Promise<Object>} Evaluation results with feedback and score
 */
export const evaluateAnswer = async(question, idealAnswer, userAnswer) => {
    try {
        const prompt = `As an expert interviewer, evaluate this interview response:

        Question: ${question}
        Ideal Answer: ${idealAnswer}
        Candidate's Answer: ${userAnswer}

        Provide evaluation in this exact JSON format:
        {
            "score": number (0-100),
            "detailedScores": {
                "technicalAccuracy": number (0-30),
                "completeness": number (0-25),
                "communication": number (0-20),
                "practicalApplication": number (0-15),
                "additionalValue": number (0-10)
            },
            "feedback": "comprehensive feedback (200-300 words)",
            "strengths": ["strength 1", "strength 2", "strength 3"],
            "improvements": ["improvement 1", "improvement 2", "improvement 3"],
            "keyMissing": ["point 1", "point 2"],
            "additionalResources": ["resource 1", "resource 2"]
        }`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{
                    role: "system",
                    content: "You are an expert technical interviewer known for fair and constructive feedback. IMPORTANT: Return ONLY valid JSON. Ensure all strings are properly escaped. Replace newlines with \\n and escape quotes with \\\"."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        });

        let aiResponse = response.choices[0].message.content;
        let cleanJson = extractJsonFromMarkdown(aiResponse);
        
        let result;
        try {
            result = JSON.parse(cleanJson);
        } catch (err) {
            console.error('JSON Parse Error:', err.message);
            console.error('Failed JSON content:', cleanJson);
            try {
                result = JSON.parse(jsonrepair(cleanJson));
            } catch (repairErr) {
                console.error('JSON Repair Error:', repairErr.message);
                // Return a fallback evaluation if JSON parsing completely fails
                return {
                    score: 50,
                    detailedScores: {
                        technicalAccuracy: 15,
                        completeness: 12,
                        communication: 10,
                        practicalApplication: 8,
                        additionalValue: 5
                    },
                    feedback: "Unable to parse AI evaluation. Please try again.",
                    strengths: ["Answer provided"],
                    improvements: ["Try rephrasing your answer"],
                    keyMissing: [],
                    additionalResources: []
                };
            }
        }
        
        return result;

    } catch (error) {
        return handleGroqError(error);
    }
};

/**
 * Generate a career roadmap with milestones and resources
 * @param {Array<string>} currentSkills - List of current skills
 * @param {string} targetCareer - Target career role
 * @param {number} timeframe - Timeframe in months
 * @returns {Promise<Object>} Detailed career roadmap
 */
export const generateCareerRoadmap = async(currentSkills, targetCareer, timeframe = 12) => {
    try {
        const prompt = `As an expert career counselor, create a detailed career roadmap from current skills to target career within ${timeframe} months.

        Current Skills: ${currentSkills.join(', ')}
        Target Career: ${targetCareer}

        IMPORTANT INSTRUCTIONS FOR RESOURCES:
        - Provide REAL, WORKING URLs for each resource (Coursera, Udemy, YouTube, official documentation)
        - For courses: Use Coursera.org or Udemy.com links
        - For videos: Use actual YouTube video/playlist URLs
        - For books: Use official publisher or free online versions (O'Reilly, Packt, or free PDFs)
        - For articles: Use Medium, Towards Data Science, or official blogs
        - For documentation: Use official docs (tensorflow.org, pytorch.org, etc.)
        - NEVER use placeholder URLs - every URL must be a real, accessible link

        Return the response in this exact JSON format:
        {
            "milestones": [
                {
                    "title": "milestone title",
                    "timeframe": {
                        "start": number,
                        "end": number
                    },
                    "requiredSkills": [
                        {
                            "skill": "skill name",
                            "proficiencyLevel": "basic/intermediate/advanced/expert"
                        }
                    ],
                    "resources": [
                        {
                            "title": "specific resource name (e.g., 'Machine Learning by Andrew Ng on Coursera')",
                            "type": "course/book/article/video/documentation/project/certification",
                            "url": "REAL working URL (e.g., https://www.coursera.org/learn/machine-learning)",
                            "estimatedTimeInHours": number,
                            "priority": "high/medium/low"
                        }
                    ],
                    "description": "detailed milestone description"
                }
            ],
            "industryInsights": [
                {
                    "topic": "insight topic",
                    "description": "detailed insight",
                    "relevance": "why this matters"
                }
            ],
            "totalEstimatedMonths": number
        }

        Example resource format:
        {
            "title": "Machine Learning Specialization by Andrew Ng",
            "type": "course",
            "url": "https://www.coursera.org/specializations/machine-learning-introduction",
            "estimatedTimeInHours": 40,
            "priority": "high"
        }`;

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{
                    role: "system",
                    content: "You are an expert career counselor with deep knowledge of professional development paths."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000
        });

        let aiResponse = response.choices[0].message.content;
        let cleanJson = extractJsonFromMarkdown(aiResponse);
        
        let result;
        try {
            result = JSON.parse(cleanJson);
        } catch (err) {
            result = JSON.parse(jsonrepair(cleanJson));
        }
        
        return result;

    } catch (error) {
        return handleGroqError(error);
    }
};

// User Journey (important for understanding the flow):
// 1. User uploads resume for job X
//    ↓
// 2. Resume Analysis
//    - Gets 60/100 score
//    - Suggests format improvements
//    ↓
// 3. Skill Gap Analysis
//    - Shows missing skills for job X
//    - Creates 6-month learning plan
//    ↓
// 4. User improves skills (follows plan)
//    ↓
// 5. User updates resume
//    ↓
// 6. New Resume Analysis
//    - Gets better score