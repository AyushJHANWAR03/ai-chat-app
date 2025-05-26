import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.personalchatbot.online/api'; 

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle token validation and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Clear the invalid token
        localStorage.removeItem('token');
        
        // Show error message
        toast.error('Session expired. Please login again.');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      
      // Handle other errors
      const errorMessage = error.response.data?.message || 'An error occurred';
      toast.error(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default api; 

// 'https://ai-chat-app-8cbv.onrender.com/api'