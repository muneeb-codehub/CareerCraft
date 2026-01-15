// src/services/resumeApi.js
import api from './api';

/**
 * Upload resume text content
 * Endpoint: POST /api/resume/upload
 */
export const uploadResumeText = async (title, content) => {
  try {
    const response = await api.post('/resume/upload', {
      title,
      content,
    });
    return response.data;
  } catch (error) {
    console.error('Upload resume text error:', error);
    throw new Error(
      (error.response?.data?.message) || 'Failed to upload resume'
    );
  }
};

/**
 * Create or upload resume (file or form)
 * Endpoint: POST /api/resume/create
 */
export const createOrUploadResume = async (data) => {
  try {
    const formData = new FormData();

    if (data.file) {
      console.log('File upload mode:', data.file.name);
      formData.append('resume', data.file);
      formData.append('title', data.title);
    } else if (data.resumeInfo) {
      console.log('Form-based creation mode');
      formData.append('resumeInfo', JSON.stringify(data.resumeInfo));
      if (data.title) formData.append('title', data.title);
    } else {
      throw new Error('Either file or resume info must be provided');
    }

    const response = await api.post('/resume/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Create/Upload resume error:', error);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      'Failed to create/upload resume'
    );
  }
};

/**
 * Get all user resumes
 */
export const getUserResumes = async () => {
  try {
    const response = await api.get('/resume/user-resumes');
    return response.data;
  } catch (error) {
    console.error('Get user resumes error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch resumes'
    );
  }
};

/**
 * Get specific resume by ID
 */
export const getResumeById = async (resumeId) => {
  try {
    if (!resumeId) throw new Error('Resume ID is required');

    const response = await api.get(`/api/resume/${resumeId}`);
    return response.data;
  } catch (error) {
    console.error('Get resume by ID error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch resume'
    );
  }
};

/**
 * Enhance resume with AI
 */
export const enhanceResume = async (resumeId, targetRole = 'softwareEngineer') => {
  try {
    if (!resumeId) throw new Error('Resume ID is required');

    console.log('Enhancing resume:', { resumeId, targetRole });

    const response = await api.post(`/resume/${resumeId}/enhance`, {
      role: targetRole,
    });

    console.log('Enhancement response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Enhance resume error:', error);
    throw new Error(
      error.response?.data?.message ||
      error.response?.data?.error?.message ||
      'Failed to enhance resume with AI'
    );
  }
};

/**
 * Export resume to PDF/DOCX
 */
export const exportResume = async (resumeId, format = 'pdf') => {
  try {
    if (!resumeId) throw new Error('Resume ID is required');
    if (!['pdf', 'docx'].includes(format))
      throw new Error('Invalid format. Only PDF and DOCX are supported');

    console.log('Exporting resume:', { resumeId, format });

    const response = await api.post(
      `/resume/${resumeId}/export`,
      { format },
      { responseType: 'blob' }
    );

    const mimeType =
      format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return new Blob([response.data], { type: mimeType });
  } catch (error) {
    console.error('Export resume error:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to export resume'
    );
  }
};

/**
 * Download helper
 */
export const downloadBlob = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Validate resume file
 */
export const isValidResumeFile = (file) => {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload PDF or DOCX files only.');
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload files smaller than 10MB.');
  }

  return true;
};

/**
 * Role mapping (frontend <-> backend)
 */
export const getTargetRoleValue = (roleLabel) => {
  const roleMap = {
    'Software Engineer': 'softwareEngineer',
    'Full Stack Developer': 'fullStackDeveloper',
    'Data Scientist': 'dataScientist',
    'Product Manager': 'productManager',
    'Marketing Manager': 'marketingManager',
    'Sales Representative': 'salesRepresentative',
    'Business Analyst': 'businessAnalyst',
    'Designer': 'designer',
    'Other': 'other',
  };

  return roleMap[roleLabel] || 'softwareEngineer';
};

export const getRoleDisplayName = (roleValue) => {
  const displayMap = {
    softwareEngineer: 'Software Engineer',
    fullStackDeveloper: 'Full Stack Developer',
    dataScientist: 'Data Scientist',
    productManager: 'Product Manager',
    marketingManager: 'Marketing Manager',
    salesRepresentative: 'Sales Representative',
    businessAnalyst: 'Business Analyst',
    designer: 'Designer',
    other: 'Other',
  };

  return displayMap[roleValue] || 'Software Engineer';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate resume form data
 */
export const validateResumeForm = (formData) => {
  const errors = {};

  // Personal Info
  if (!formData.personalInfo.name?.trim()) {
    errors.name = 'Full name is required';
  }

  if (!formData.personalInfo.email?.trim()) {
    errors.email = 'Email address is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
    errors.email = 'Email address is invalid';
  }

  if (!formData.personalInfo.jobTitle?.trim()) {
    errors.jobTitle = 'Job title is required';
  }

  // Education
  if (!formData.education || formData.education.length === 0) {
    errors.education = 'At least one education entry is required';
  } else {
    formData.education.forEach((edu, index) => {
      if (!edu.degree?.trim()) {
        errors[`education_${index}_degree`] = 'Degree is required';
      }
      if (!edu.institution?.trim()) {
        errors[`education_${index}_institution`] = 'Institution is required';
      }
    });
  }

  // Experience
  if (formData.experience && formData.experience.length > 0) {
    formData.experience.forEach((exp, index) => {
      if (exp.title?.trim() && !exp.company?.trim()) {
        errors[`experience_${index}_company`] =
          'Company is required when job title is provided';
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
