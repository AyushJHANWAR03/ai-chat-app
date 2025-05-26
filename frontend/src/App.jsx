import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LoginPage from './pages/LoginPage'
import PersonasPage from './pages/PersonasPage'
import ChatPage from './pages/ChatPage'
import { Toaster } from 'react-hot-toast'
import { isAuthenticated, checkAndRedirect } from './utils/auth'
import { useEffect, useState } from 'react'

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const valid = await checkAndRedirect();
        setIsValid(valid);
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full h-12 w-12 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route component (redirects to /personas if already logged in)
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/personas" replace />;
  }
  return children;
};

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  console.log('Environment:', import.meta.env.MODE);
  console.log('Base URL:', import.meta.env.VITE_API_URL);
  
  if (!clientId) {
    console.error('Google Client ID is missing. Please check your .env file.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">Error: Google Client ID is missing</h1>
          <p className="mt-2">Please check your .env file and make sure VITE_GOOGLE_CLIENT_ID is set correctly.</p>
          <p className="mt-2 text-gray-600">Current environment: {import.meta.env.MODE}</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider 
      clientId={clientId}
      onScriptLoadError={(err) => {
        console.error('Google OAuth script failed to load:', err);
      }}
    >
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/personas" 
            element={
              <ProtectedRoute>
                <PersonasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat/:sessionId" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated() ? 
                <Navigate to="/personas" replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          {/* Add other routes here */}
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
