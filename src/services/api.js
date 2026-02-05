// Placeholder for API services
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = {
    get: async (endpoint) => {
        // Implement GET request
        console.log(`GET ${endpoint}`);
        return Promise.resolve({});
    },
    post: async (endpoint, data) => {
        // Implement POST request
        console.log(`POST ${endpoint}`, data);
        return Promise.resolve({});
    },
};
