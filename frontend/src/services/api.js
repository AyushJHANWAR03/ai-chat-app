import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8890/api'; 

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

export default api; 

// 'https://ai-chat-app-8cbv.onrender.com/api'