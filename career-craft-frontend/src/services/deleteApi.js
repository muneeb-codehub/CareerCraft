import api from './api';

/**
 * Delete a resume
 */
export const deleteResume = async (id) => {
    try {
        const response = await api.delete(`/resume/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting resume:', error);
        throw error;
    }
};

/**
 * Delete a career roadmap
 */
export const deleteRoadmap = async (id) => {
    try {
        const response = await api.delete(`/roadmap/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting roadmap:', error);
        throw error;
    }
};

/**
 * Delete a skill gap analysis
 */
export const deleteSkillGap = async (id) => {
    try {
        const response = await api.delete(`/skillgap/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting skill gap analysis:', error);
        throw error;
    }
};

/**
 * Delete an interview session
 */
export const deleteInterview = async (id) => {
    try {
        const response = await api.delete(`/interview/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting interview:', error);
        throw error;
    }
};
