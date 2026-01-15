import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Document, Paragraph, Packer } from 'docx';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Convert uploaded file to text
 * @param {Buffer} fileBuffer - The uploaded file buffer
 * @param {string} fileType - The file type (pdf/docx)
 */
export const extractTextFromFile = async(fileBuffer, fileType) => {
    try {
        if (fileType === 'pdf') {
            try {
                const data = await pdfParse(fileBuffer, {
                    // Add options to handle corrupted PDFs
                    max: 0, // Parse all pages
                    version: 'v1.10.100'
                });
                return data.text;
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError.message);
                // If PDF parsing fails, return a helpful error message
                throw new Error('Unable to read PDF file. The file may be corrupted, password-protected, or in an unsupported format. Please try with a different PDF file or use DOCX format.');
            }
        } else if (fileType === 'docx') {
            try {
                const result = await mammoth.extractRawText({ buffer: fileBuffer });
                return result.value;
            } catch (docxError) {
                console.error('DOCX parsing error:', docxError.message);
                throw new Error('Unable to read DOCX file. The file may be corrupted or in an unsupported format. Please try with a different file.');
            }
        }
        throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    } catch (error) {
        console.error('Text extraction error:', error);
        throw error;
    }
};

/**
 * Generate PDF document from resume content
 * @param {string} content - The resume content
 * @param {string} outputPath - Where to save the PDF
 */
export const generatePDF = (content, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(outputPath);

            doc.pipe(stream);
            doc.text(content);
            doc.end();

            stream.on('finish', () => {
                resolve(outputPath);
            });

            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Generate DOCX document from resume content
 * @param {string} content - The resume content
 * @param {string} outputPath - Where to save the DOCX
 */
export const generateDOCX = async(content, outputPath) => {
    try {
        // Split content into lines and filter out empty lines
        const lines = content.split('\n').filter(line => line.trim());

        // Create paragraphs for each line
        const paragraphs = lines.map(line => {
            return new Paragraph({
                text: line.trim(),
                spacing: {
                    after: 200 // Add some space after each paragraph
                }
            });
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);
        return outputPath;
    } catch (error) {
        console.error('DOCX generation error:', error);
        throw error;
    }
};

/**
 * Clean up temporary files
 * @param {string} filePath - Path to file to delete
 */
export const cleanupFile = async(filePath) => {
    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        console.error('File cleanup error:', error);
    }
};