import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const PersonasPage = () => {
  const navigate = useNavigate();

  const personas = [
    { 
      type: 'girlfriend', 
      name: 'Girlfriend', 
      description: 'A caring and supportive companion who listens and understands',
      emoji: '💝'
    },
    { 
      type: 'therapist', 
      name: 'Therapist', 
      description: 'A professional guide for your thoughts and emotions',
      emoji: '🧠'
    },
    { 
      type: 'friend', 
      name: 'Friend', 
      description: 'A casual and fun conversation partner',
      emoji: '😊'
    }
  ];

  const handlePersonaSelect = async (personaType) => {
    try {
      console.log('Starting chat session for persona:', personaType);
      // First try to get an existing session
      const response = await api.post(`/chat/${personaType}/start`);
      console.log('Session response:', response.data);
      
      if (!response.data || !response.data._id) {
        console.error('Invalid session response:', response.data);
        throw new Error('Invalid session ID received from server');
      }
      
      const sessionId = response.data._id;
      console.log('Navigating to session:', sessionId);
      
      // Ensure we have a valid sessionId before navigating
      if (sessionId) {
        // Navigate to the chat page with the session ID
        navigate(`/chat/${sessionId}`, { replace: true });
      } else {
        throw new Error('No session ID received');
      }
    } catch (error) {
      console.error('Error starting chat session:', error);
      toast.error(error.response?.data?.message || 'Failed to start chat session. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-screen-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Chat Partner</h1>
          <p className="text-gray-600">Select an AI persona that matches your mood</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personas.map((persona) => (
            <div
              key={persona.type}
              onClick={() => handlePersonaSelect(persona.type)}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-4xl">{persona.emoji}</span>
                  <h2 className="text-xl font-semibold text-gray-800">{persona.name}</h2>
                </div>
                <p className="text-gray-600 text-sm">{persona.description}</p>
                <div className="mt-4 text-right">
                  <span className="text-blue-500 text-sm font-medium group-hover:underline">
                    Start Chat →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonasPage; 