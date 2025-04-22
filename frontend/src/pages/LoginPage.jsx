import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the Google ID token
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Extract user information
      const { sub: googleId, email, name, picture } = decoded;

      // Send to backend
      const response = await axios.post('http://localhost:8890/api/auth/google', {
        googleId,
        email,
        name,
        profilePic: picture
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Show success message
      toast.success('Login successful!');
      
      // Redirect to personas page
      navigate('/personas');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to AI Chat</h1>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 