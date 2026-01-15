import Resume from "../models/Resume.js";
import { analyzeResume } from "../utils/openai.js";
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination.js';

/**
 * desc    Get AI suggestions for resume
 * route   POST /api/resume/:id/enhance
 * access  Private
 */
export const getAISuggestions = async(req, res) => {
    try {
        const { role = 'softwareEngineer' } = req.body;
        const resume = await Resume.findById(req.params.id);

        // Checking if resume exists and belongs to user
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        if (resume.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this resume"
            });
        }

        // Get AI suggestions using OpenAI
        const suggestions = await analyzeResume(resume.content, role);
        console.log('AI Suggestions received:', suggestions);

        // Update resume with AI suggestions using updateOne
        try {
            const updateResult = await Resume.updateOne({ _id: resume._id }, {
                $set: {
                    aiSuggestions: {
                        formatting: suggestions.formatting || [],
                        keywords: suggestions.keywords || [],
                        improvements: suggestions.improvements || [],
                        atsScore: suggestions.atsScore || 0,
                        lastUpdated: new Date()
                    },
                    status: "enhanced"
                }
            });
            console.log('Update result:', updateResult);

            // Fetch the updated resume
            const updatedResume = await Resume.findById(resume._id);
            console.log('Updated resume:', updatedResume);

            res.json({
                success: true,
                message: "AI suggestions generated and saved",
                data: {
                    role,
                    suggestions: {
                        formatting: suggestions.formatting || [],
                        keywords: suggestions.keywords || [],
                        improvements: suggestions.improvements || [],
                        atsScore: suggestions.atsScore || 0,
                        lastUpdated: new Date()
                    }
                }
            });
        } catch (saveError) {
            console.error('Error saving resume:', saveError);
            throw saveError;
        }
    } catch (error) {
        console.error("AI suggestion error:", error);
        res.status(500).json({
            success: false,
            message: "Error generating AI suggestions",
            error: {
                message: error.message,
                type: error.type || 'Unknown',
                code: error.code || 'Unknown'
            }
        });
    }
};

/**
 * desc    Upload resume text
 * route   POST /api/resume/upload
 * access  Private
 */
export const uploadResume = async(req, res) => {
    try {
        const { title, content } = req.body;

        // Validate input
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Please provide both title and content"
            });
        }

        // Create resume
        const resume = await Resume.create({
            userId: req.user._id,
            title,
            content,
            source: 'upload', // Adding required source field
            status: "draft"
        });

        res.status(201).json({
            success: true,
            message: "Resume uploaded successfully",
            data: { resume }
        });

    } catch (error) {
        console.error("Resume upload error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error uploading resume"
        });
    }
};

/**
 * desc    Get all resumes for a user (with pagination)
 * route   GET /api/resume/user-resumes?page=1&limit=10&sort=-createdAt
 * access  Private
 */
export const getUserResumes = async(req, res) => {
    try {
        // Get pagination parameters
        const { page, limit, sort, skip } = getPaginationParams(req, {
            page: 1,
            limit: 10,
            sort: '-createdAt'
        });

        // Get total count and paginated data
        const [resumes, total] = await Promise.all([
            Resume.find({ userId: req.user._id })
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .select("-content") // Exclude content for list view
                .lean(),
            Resume.countDocuments({ userId: req.user._id })
        ]);

        // Build paginated response
        const response = buildPaginationResponse(resumes, page, limit, total);

        res.json(response);

    } catch (error) {
        console.error("Get resumes error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching resumes"
        });
    }
};

/**
 * desc    Get specific resume by ID
 * route   GET /api/resume/:id
 * access  Private
 */
export const getResumeById = async(req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        // Check if resume exists
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        // Check if resume belongs to user
        if (resume.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this resume"
            });
        }

        res.json({
            success: true,
            data: { resume }
        });

    } catch (error) {
        console.error("Get resume error:", error);

        // Handle invalid ID format
        if (error.kind === "ObjectId") {
            return res.status(400).json({
                success: false,
                message: "Invalid resume ID"
            });
        }

        res.status(500).json({
            success: false,
            message: "Error fetching resume"
        });
    }
};

/**
 * desc    Upload resume file (optional)
 * route   POST /api/resume/upload-file
 * access  Private
 */
import path from 'path';
import fs from 'fs';
import { extractTextFromFile, generatePDF, generateDOCX, cleanupFile } from '../utils/documentHandler.js';
import { generateResumeContent } from '../utils/resumeGenerator.js';

// Ensure exports directory exists
const exportsDir = path.join(process.cwd(), 'exports');
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
}

export const createOrUploadResume = async (req, res) => {
  try {
    let resumeData;

    // ---------- Flow A: File Upload ----------
    if (req.file) {
      console.log("File upload detected:", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      const ext = path.extname(req.file.originalname || '').toLowerCase();
      const fileType = ext === '.pdf' ? 'pdf' : 'docx';

      if (!req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "File buffer is not available. Make sure you're using memory storage or sending file correctly"
        });
      }

      // extract text using your util
      let content;
      try {
        content = await extractTextFromFile(req.file.buffer, fileType);
        
        // Check if extracted content is empty or too short
        if (!content || content.trim().length < 10) {
          return res.status(400).json({
            success: false,
            message: "Unable to extract text from the uploaded file. The file may be empty, corrupted, or in an unsupported format. Please try a different file."
          });
        }
      } catch (extractError) {
        console.error('File extraction error:', extractError);
        return res.status(400).json({
          success: false,
          message: extractError.message || "Failed to process the uploaded file. Please ensure the file is not corrupted or password-protected."
        });
      }

      resumeData = {
        userId: req.user._id,
        title:
          req.body.title ||
          path.basename(req.file.originalname, path.extname(req.file.originalname)),
        content,
        source: 'upload',
        originalFile: {
          name: req.file.originalname,
          type: fileType,
          size: req.file.size,
        },
        status: 'draft',
      };

      // ---------- Flow B: Form-based creation ----------
    } else if (req.body.resumeInfo) {
      // resumeInfo may be JSON string (from frontend FormData) — parse safely
      let resumeInfo = req.body.resumeInfo;
      if (typeof resumeInfo === 'string') {
        try {
          resumeInfo = JSON.parse(resumeInfo);
        } catch (parseErr) {
          console.error('Failed to parse resumeInfo JSON:', parseErr, 'raw:', req.body.resumeInfo);
          return res.status(400).json({
            success: false,
            message: "Invalid JSON in resumeInfo field",
            error: parseErr.message
          });
        }
      }

      // Destructure after parsing - additionalInfo removed
      const { personalInfo, education, experience, skills } = resumeInfo || {};

      // Extract skills from personalInfo.skills (new structure) or from top-level skills (backward compatibility)
      let normalizedSkills = personalInfo?.skills || skills;
      if (typeof normalizedSkills === 'string') {
        normalizedSkills = normalizedSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (!Array.isArray(normalizedSkills)) {
        normalizedSkills = [];
      }

      // Log for debugging
      console.log('Resume Info Structure:', {
        hasPersonalInfo: !!personalInfo,
        personalInfoKeys: personalInfo ? Object.keys(personalInfo) : [],
        skillsFromPersonalInfo: personalInfo?.skills,
        skillsFromTopLevel: skills,
        normalizedSkills
      });

      // Normalize experience: allow empty array (optional)
      let normalizedExperience = experience;
      if (!Array.isArray(normalizedExperience)) {
        normalizedExperience = [];
      }

      // Basic validation - experience is now optional
      if (!personalInfo || !personalInfo.name || !normalizedSkills || normalizedSkills.length === 0 || !education || !Array.isArray(education) || education.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required resume information: personalInfo (with name), at least one education entry, and at least one skill. Work experience is optional.",
          details: {
            hasPersonalInfo: !!personalInfo,
            hasName: !!(personalInfo && personalInfo.name),
            hasEducation: Array.isArray(education) && education.length > 0,
            hasSkills: Array.isArray(normalizedSkills) && normalizedSkills.length > 0
          }
        });
      }

      // generate content from form data using AI - use normalizedExperience
      const content = await generateResumeContent({
        personalInfo,
        education,
        experience: normalizedExperience,
        skills: normalizedSkills
      });

      resumeData = {
        userId: req.user._id,
        title: `${personalInfo.name}'s Resume`,
        content,
        source: 'form',
        formData: {
          personalInfo,
          education,
          experience: normalizedExperience,
          skills: normalizedSkills
        },
        status: 'draft'
      };

    } else {
      // neither file nor resumeInfo provided
      return res.status(400).json({
        success: false,
        message: "Please either upload a file (field name: 'resume') or provide resumeInfo in the request body"
      });
    }

    // Create resume in DB
    const resume = await Resume.create(resumeData);

    return res.status(201).json({
      success: true,
      message: `Resume ${resumeData.source === 'upload' ? 'uploaded' : 'created'} successfully`,
      data: { resume }
    });

  } catch (error) {
    console.error("Resume creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error processing resume",
      error: {
        type: error.name,
        details: error.toString()
      }
    });
  }
};

/**
 * @desc    Export resume to PDF/DOCX
 * @route   POST /api/resume/:id/export
 * @access  Private
 */
export const exportResume = async(req, res) => {
    try {
        const { format } = req.body; // 'pdf' or 'docx'

        if (!['pdf', 'docx'].includes(format)) {
            return res.status(400).json({
                success: false,
                message: "Invalid format. Please choose 'pdf' or 'docx'"
            });
        }

        const resume = await Resume.findById(req.params.id);

        // Check if resume exists and belongs to user
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        if (resume.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to access this resume"
            });
        }

        // Generate unique filename
        const fileName = `${resume.title}-${Date.now()}.${format}`;
        const outputPath = path.join(exportsDir, fileName);

        // Generate document in requested format
        if (format === 'pdf') {
            await generatePDF(resume.content, outputPath);
        } else {
            await generateDOCX(resume.content, outputPath);
        }

        // Read file as buffer
        const fileBuffer = await fs.promises.readFile(outputPath);

        // Set headers for file download
        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
        } else {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        }
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Send file buffer directly
        res.send(fileBuffer);

        // Cleanup file
        await cleanupFile(outputPath);

    } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({
            success: false,
            message: "Error exporting resume"
        });
    }
};

/**
 * desc    Delete a resume
 * route   DELETE /api/resume/:id
 * access  Private
 */
export const deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        if (resume.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this resume"
            });
        }

        await Resume.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Resume deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting resume:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resume',
            error: error.message
        });
    }
};