import api from '../services/api';

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const validateToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;

    // Use the /api/users/profile endpoint which is protected
    // This will automatically validate our token
    const response = await api.get('/users/profile');
    return response.status === 200;
  } catch (error) {
    console.error('Token validation error:', error);
    removeToken();
    return false;
  }
};

export const checkAndRedirect = async () => {
  const isValid = await validateToken();
  if (!isValid) {
    removeToken();
    window.location.href = '/login';
  }
  return isValid;
}; 