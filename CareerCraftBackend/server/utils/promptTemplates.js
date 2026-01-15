// Resume enhancement prompt templates for different roles

export const RESUME_PROMPTS = {
    // Software Engineering roles
    softwareEngineer: `Analyze and enhance this resume for a software engineer position. Focus on:
1. Technical Skills:
   - Highlight relevant programming languages and frameworks
   - Emphasize system design and architecture experience
   - Include modern tech stack keywords

2. Project Achievements:
   - Convert statements to quantifiable achievements
   - Highlight performance improvements and optimizations
   - Emphasize scalability and efficiency gains

3. Best Practices:
   - Suggest industry-standard terminology
   - Include trending technologies if relevant
   - Format for ATS optimization

4. Areas of Improvement:
   - Identify missing critical skills
   - Suggest better achievement metrics
   - Point out formatting issues

Please provide suggestions in these categories:
- Formatting improvements
- Keyword recommendations
- Content enhancement points
- ATS optimization tips`,

    fullStackDeveloper: `Analyze and enhance this resume for a full-stack developer position. Focus on:
1. Technical Stack:
   - Balance of frontend and backend technologies
   - Database and API experience
   - DevOps and deployment skills

2. Project Impact:
   - End-to-end implementation details
   - User impact and business metrics
   - System architecture decisions

3. Best Practices:
   - Modern development methodologies
   - Performance optimization experience
   - Security best practices

4. Areas of Improvement:
   - Missing stack components
   - Architecture decision explanations
   - Development process details

Please provide suggestions in these categories:
- Formatting improvements
- Keyword recommendations
- Content enhancement points
- ATS optimization tips`,

    backendDeveloper: `Analyze and enhance this resume for a backend developer position. Focus on:
1. Technical Expertise:
   - Server-side programming languages
   - Database optimization skills
   - API design and implementation
   - System architecture experience

2. Performance Metrics:
   - Scalability achievements
   - Response time improvements
   - Database optimization results

3. Best Practices:
   - Security implementation
   - Code quality measures
   - Documentation standards

4. Areas of Improvement:
   - System design principles
   - Performance optimization techniques
   - Scalability considerations

Please provide suggestions in these categories:
- Formatting improvements
- Keyword recommendations
- Content enhancement points
- ATS optimization tips`
};

// Helper function to get prompt by role
export const getPromptByRole = (role) => {
    return RESUME_PROMPTS[role] || RESUME_PROMPTS.softwareEngineer; // Default to software engineer
};

// Function to format AI response for storage
export const formatAIResponse = (aiResponse) => {
    return {
        formatting: [], // Will contain formatting suggestions
        keywords: [], // Will contain keyword suggestions
        improvements: [], // Will contain improvement suggestions
        atsScore: 0 // Will contain ATS compatibility score
    };
};