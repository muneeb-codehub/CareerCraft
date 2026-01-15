import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads and exports directories if they don't exist
const createRequiredDirectories = () => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const exportsDir = path.join(__dirname, '../../exports');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
    }
};

// Save enhanced resume to exports folder
const saveEnhancedResume = async(userId, content) => {
    const fileName = `enhanced-resume-${userId}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../exports', fileName);

    await fs.promises.writeFile(filePath, content);
    return fileName;
};

// Delete old files
const cleanupOldFiles = async(directory, ageInHours = 24) => {
    const dir = path.join(__dirname, '../../', directory);
    const files = await fs.promises.readdir(dir);
    const now = Date.now();

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = await fs.promises.stat(filePath);
        const age = (now - stats.mtime.getTime()) / (1000 * 60 * 60);

        if (age > ageInHours) {
            await fs.promises.unlink(filePath);
        }
    }
};

export {
    createRequiredDirectories,
    saveEnhancedResume,
    cleanupOldFiles
};