import express from "express";
import { protect } from "../middlewares/auth3.js";
import { trackActivity } from "../middlewares/activityTracker.js";
import upload, { handleMulterError } from "../config/multer.js";
import {
    uploadResume,
    getUserResumes,
    getResumeById,
    getAISuggestions,
    createOrUploadResume,
    exportResume,
    deleteResume
} from "../controllers/resume.js";

const router = express.Router();

// Protect all resume routes
router.use(protect);

// Resume routes
router.post("/upload", trackActivity('Resume Building'), uploadResume);
router.post("/create", upload.single('resume'), handleMulterError, trackActivity('Resume Building'), createOrUploadResume);
router.get("/user-resumes", getUserResumes);
router.get("/:id", getResumeById);
router.post("/:id/export", exportResume);
router.post("/:id/enhance", trackActivity('Resume Building'), getAISuggestions);
router.delete("/:id", deleteResume);

export default router;