// src/services/authService.js
import api from './api';

// Login user
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth2/login', credentials);
        return response.data;
    } catch (error) {
        throw (error.response && error.response.data) || { message: 'Login failed' };
    }
};

// Register user
export const registerUser = async(userData) => {
    try {
        const response = await api.post('/auth2/signup', userData);
        return response.data;
    } catch (error) {
        throw (error.response && error.response.data) || { message: 'Registration failed' };
    }
};