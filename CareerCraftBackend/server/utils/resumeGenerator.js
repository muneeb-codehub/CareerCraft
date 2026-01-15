import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { jsonrepair } from 'jsonrepair';

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate professionally formatted resume content using AI
 */
export const generateResumeContent = async (resumeInfo) => {
    const { personalInfo, education, experience, skills } = resumeInfo;

    // Build structured data for AI - simplify address to just country
    const resumeData = {
        personalInfo: {
            name: personalInfo.name,
            jobTitle: personalInfo.jobTitle,
            email: personalInfo.email,
            phone: personalInfo.phone,
            address: 'Pakistan', // Simplified to just country
            dateOfBirth: personalInfo.dateOfBirth
        },
        education: education.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            year: edu.year,
            details: edu.details || 'N/A'
        })),
        experience: experience && experience.length > 0 ? experience.map(exp => ({
            title: exp.title,
            company: exp.company,
            duration: exp.duration,
            details: exp.details
        })) : [],
        skills: skills
    };

    const prompt = `You are an elite executive resume writer with 15+ years of experience crafting compelling career narratives for Fortune 500 executives and industry leaders. Your expertise lies in creating ATS-optimized, recruitment-ready resumes that command attention and secure interviews.

OUTPUT REQUIREMENTS - ABSOLUTE COMPLIANCE MANDATORY:
═══════════════════════════════════════════════════
1. DO NOT use ** for section headers - write them in plain text, ALL CAPITALS only
2. Section headers: PROFILE, EXECUTIVE SUMMARY, CORE COMPETENCIES, etc. (plain text, no formatting)
3. Use bullet points (•) for list items with proper indentation
4. Zero commentary, zero explanations, zero meta-text - deliver pure resume content only
5. Professional spacing: One blank line between major sections, strategic whitespace for readability

ARCHITECTURAL FRAMEWORK - PRECISION STRUCTURE:
═══════════════════════════════════════════════

CONTACT HEADER
[Full Name]
[Job Title]
[Email] | [Phone]
Pakistan


EXECUTIVE SUMMARY
[Opening Statement: 2-3 power-packed sentences establishing unique value proposition, industry expertise, and differentiation factors. Focus on strategic impact, technical depth, and proven leadership capabilities.]

[Achievement Narrative: 2-3 sentences showcasing quantifiable track record, transformation initiatives, and collaborative excellence. Emphasize measurable outcomes, innovation, and cross-functional leadership.]


PROFESSIONAL EXPERIENCE

[Job Title] | [Company Name] | [Duration]

• Developed [specific project/solution] using [exact technologies from user's data], which [describe the impact without using percentages - use descriptive terms like "significantly improved", "enhanced", "streamlined"]

• Built [specific feature/system] that [describe functionality and impact in plain language without percentage metrics]

• Collaborated with [team description] to [specific achievement using actual details from user's experience]

• Implemented [specific technology/approach] resulting in [tangible outcome described qualitatively]

[Repeat format for additional positions using ONLY the actual experience data provided]


EDUCATION & CREDENTIALS
[Degree] | [Institution] | [Year Range]
CGPA: [Actual CGPA from user data]

Academic Projects:
• [Project description with specific technologies and outcomes from user's data]

Relevant Coursework: [Generate 4-5 relevant courses based on the user's degree field.]


TECHNICAL EXPERTISE
[List ALL skills provided by user in a clean, readable format]
[If user has provided skills like "C++, Java, Python", organize them appropriately]
[DO NOT create empty categories - simply list the skills the user has provided]
[Example format if user provides general skills:]
• C++
• Java
• Python
• React
• Node.js
[OR if user's skills naturally fit categories, organize them as:]
Programming Languages: C++, Java, Python
Web Technologies: React, Node.js, Express
[Use ONLY what user has provided - no invention, no assumptions]


PROFESSIONAL CERTIFICATIONS
[ONLY certifications explicitly provided by user - if none provided, omit this entire section]



EXECUTIVE SUMMARY MASTERY:
→ Paragraph 1: Strategic positioning statement establishing subject matter authority, years of specialized experience, and unique technical-business intersection value
→ Paragraph 2: Quantified achievement narrative showcasing transformation leadership, innovation drive, and collaborative impact across organizational boundaries
→ Eliminate generic phrases: "hard worker," "team player," "fast learner"
→ Emphasize distinctive capabilities that differentiate from peer competition

PROFESSIONAL EXPERIENCE EXCELLENCE:
→ CRITICAL: Use ONLY the actual experience data provided by the user
→ DO NOT invent percentage improvements or metrics (no "25% increase", "30% reduction", etc.)
→ Describe achievements using qualitative language: "significantly improved", "enhanced performance", "streamlined processes", "optimized functionality"
→ Power verb initiation: Developed, Built, Implemented, Created, Designed, Collaborated
→ Technical specificity: Use ONLY the exact technologies, frameworks, and tools mentioned by the user
→ DO NOT fabricate metrics or numbers - focus on describing what was actually accomplished
→ If user provides specific metrics, use those; otherwise describe impact qualitatively

EDUCATION SECTION PRECISION:
→ CGPA inclusion mandatory if above 2.0/4.0
→ Academic projects transformed into mini-case studies demonstrating:
  * Technical stack mastery with specific version details
  * Problem-solving methodology and architectural decisions
  * Measurable outcomes (performance metrics, accuracy rates, scalability achievements)
→ Relevant coursework: Generate 6-8 appropriate courses based on the degree field:
  * Computer Science/Software Engineering: Data Structures, Algorithms, Object-Oriented Programming, Database Management Systems, Web Development, Software Engineering, Computer Networks, Operating Systems
  * Data Science: Machine Learning, Statistical Analysis, Data Mining, Big Data Analytics, Python Programming, Data Visualization
  * Electrical Engineering: Circuit Design, Digital Electronics, Microprocessors, Control Systems, Power Systems, Signal Processing
  * Mechanical Engineering: Thermodynamics, Fluid Mechanics, CAD/CAM, Manufacturing Processes, Machine Design, Mechanics of Materials
  * Business/Management: Strategic Management, Financial Accounting, Marketing, Operations Management, Business Analytics, Organizational Behavior
  * Other fields: Generate contextually appropriate courses based on the degree name
→ Add any additional courses mentioned by user to the field-appropriate list

TECHNICAL EXPERTISE ARCHITECTURE:
→ CRITICAL: Include ONLY technologies explicitly mentioned in the user's provided data
→ DO NOT create empty categories with "" placeholders
→ List skills in a clean, readable format - either as bullet points or organized by category based on what makes sense for the skills provided
→ DO NOT invent or assume skills - list only what the user has actually provided
→ Example: If user provides ["C++", "Java", "React", "Node.js"], intelligently organize them:
  * Programming Languages: C++, Java
  * Web Technologies: React, Node.js
  OR simply list as bullets if that's clearer
→ DO NOT add commonly associated technologies unless user specifically mentioned them
→ Accuracy over completeness - better to have fewer accurate skills than invented ones
→ If only 2-3 skills provided, list them cleanly without forcing categorization

PROHIBITED CONTENT:
→ Date of birth / Age references
→ Marital status / Family information
→ Photograph (unless specifically requested for regional requirements)
→ References statement ("Available upon request" - assumed standard)
→ Salary information / expectations
→ Reasons for leaving previous positions
→ Personal pronouns (I, me, my, we, our)
→ Generic objectives ("Seeking challenging position to leverage skills")

ATS OPTIMIZATION PROTOCOL:
→ Standard section headers for parsing algorithm recognition
→ Simple, clean formatting with consistent structure
→ Keywords from job description naturally integrated throughout
→ Acronyms spelled out on first usage: "Application Programming Interface (API)"
→ Standard date formats: "January 2023 - Present" or "Jan 2023 - Present"
→ No headers/footers, no text boxes, no graphics, no tables
→ Standard fonts with proper character encoding

RESUME DATA INPUT:
═════════════════
${JSON.stringify(resumeData, null, 2)}

EXECUTION DIRECTIVE:
═══════════════════
Generate the complete, publication-ready resume adhering to every specification above. Output pure plain text with zero markdown. Zero explanations. Zero additional commentary. Deliver professional excellence in ASCII format ready for immediate ATS submission and human review.`;
    
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{
                role: "system",
                content: "You are an expert resume writer. Create professional, ATS-friendly resumes. OUTPUT ONLY THE RESUME CONTENT - absolutely no notes, explanations, or commentary about your changes. Just the polished resume."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        let generatedContent = response.choices[0].message.content.trim();
        
        // Remove any "Note:" sections or explanatory text at the end
        const noteIndex = generatedContent.toLowerCase().indexOf('\nnote:');
        if (noteIndex !== -1) {
            generatedContent = generatedContent.substring(0, noteIndex).trim();
        }
        
        // Remove any explanatory headers or footers
        generatedContent = generatedContent
            .replace(/^(Here is|Here's|Below is).*?:?\n+/i, '')
            .replace(/\n+(I have made|Note:|Please note)[\s\S]*$/i, '')
            .trim();

        return generatedContent;

    } catch (error) {
        console.error('AI Resume Generation Error:', error);
        // Fallback to basic template if AI fails
        return generateBasicResumeTemplate(resumeInfo);
    }
};

/**
 * Fallback: Generate basic formatted resume content without AI
 */
const generateBasicResumeTemplate = (resumeInfo) => {
    const { personalInfo, education, experience, skills } = resumeInfo;

    const header = `${personalInfo.name}
${personalInfo.jobTitle}
${personalInfo.email} | ${personalInfo.phone}
${personalInfo.address}
`;

    const educationSection = education && education.length > 0 ? `
EDUCATION
${education.map(edu => `
${edu.degree}
${edu.institution}, ${edu.year}
${edu.details ? edu.details : 'Relevant coursework and achievements'}
`).join('\n')}
` : '';

    const experienceSection = experience && experience.length > 0 ? `
PROFESSIONAL EXPERIENCE
${experience.map(exp => `
${exp.title} | ${exp.company}
${exp.duration}
• ${exp.details}
`).join('\n')}
` : '';

    const skillsSection = skills && skills.length > 0 ? `
SKILLS
${skills.join(' • ')}
` : '';

    return `${header}${educationSection}${experienceSection}${skillsSection}`.trim();
};