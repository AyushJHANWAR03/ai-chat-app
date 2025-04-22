import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import LoginPage from './pages/LoginPage'
import PersonasPage from './pages/PersonasPage'
import ChatPage from './pages/ChatPage'
import { Toaster } from 'react-hot-toast'

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">Error: Google Client ID is missing</h1>
          <p className="mt-2">Please check your .env file and make sure VITE_GOOGLE_CLIENT_ID is set correctly.</p>
        </div>
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/chat/:personaType" element={<ChatPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Add other routes here */}
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  )
}

export default App
