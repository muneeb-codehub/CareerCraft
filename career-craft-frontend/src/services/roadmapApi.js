// src/services/roadmapApi.js
import api from './api';

// Generate new career roadmap
export const generateRoadmap = async (data) => {
  try {
    const response = await api.post('/roadmap/generate', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate roadmap' };
  }
};

// Get roadmap by ID
export const getRoadmapById = async (roadmapId) => {
  try {
    const response = await api.get(`/roadmap/${roadmapId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch roadmap' };
  }
};

// Get user's roadmap history
export const getUserRoadmaps = async () => {
  try {
    const response = await api.get('/roadmap/user/history');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch roadmap history' };
  }
};

// Update roadmap progress
export const updateRoadmapProgress = async (roadmapId, progressData) => {
  try {
    const response = await api.put(`/roadmap/${roadmapId}/update`, progressData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update roadmap progress' };
  }
};
