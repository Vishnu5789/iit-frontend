// API Configuration
// In production (Vercel), set VITE_API_URL environment variable
// In development, it will use localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Remove /api suffix if needed for full base URL
export const API_SERVER_URL = API_BASE_URL.replace('/api', '');

