// src/services/api.js
import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Create axios instance
// ... existing code ...
const api = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

function handleError(error) {
    toast.error(
        (error && error.response && error.response.data && error.response.data.message) ||
        error.message ||
        'An error occurred'
    );
}
// ... existing code ...

// Request interceptor - Add token to every request
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export async function register(userData) {
    return this.makeRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
}

// Skill Gap Analysis - Connect to your backend OpenAI function
export async function analyzeSkillGap(skillGapData) {
    try {
        const response = await api.post('/skillgap/analyze', skillGapData);
        return response.data;
    } catch (error) {
        // handleError should be defined to show error messages
        handleError(error);
        throw error;
    }
}

// Helper method to make API calls
export async function makeRequest(endpoint, options = {}) {
    const url = `${api.defaults.baseURL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await api.request({
            url,
            ...config,
        });
        return response.data;
    } catch (error) {
        handleError(error);
    }
}

export const validateSkills = (skills) => {
    const validSkillCategories = {
        programming: ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Dart', 'Kotlin', 'Go', 'TypeScript', 'Rust', 'Scala', 'R'],
        web: ['HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Laravel', 'Spring Boot', 'ASP.NET'],
        databases: ['MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'Oracle', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB'],
        cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD', 'Terraform', 'Ansible'],
        mobile: ['iOS', 'Android', 'React Native', 'Flutter', 'Xamarin', 'Ionic'],
        data: ['Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Tableau', 'Power BI', 'Excel', 'Spark'],
        soft: ['Communication', 'Team Leadership', 'Project Management', 'Problem Solving', 'Agile', 'Scrum', 'Design Thinking']
    };

    const allValidSkills = Object.values(validSkillCategories).flat();
    return skills.filter(skill =>
        allValidSkills.some(validSkill =>
            validSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(validSkill.toLowerCase())
        )
    );
};

// ✅ Skill Gap Analysis API
// export const analyzeSkillGap = async(skills) => {
//     try {
//         // Filter invalid skills before sending
//         const validatedSkills = validateSkills(skills);
//         if (validatedSkills.length === 0) {
//             toast.error('No valid skills found to analyze.');
//             return;
//         }

//         const { data } = await api.post('/skillgap/analyze', { skills: validatedSkills });
//         return data;
//     } catch (error) {
//         handleError(error);
//     }
// };

export default api;