import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const PersonasPage = () => {
  const navigate = useNavigate();

  const personas = [
    {
      type: 'girlfriend',
      name: 'Ananya',
      description: 'Playful and caring',
      image: 'https://www.stylecraze.com/wp-content/uploads/2021/08/61-Things-To-Do-To-Make-Your-Girlfriend-Happy_1200px.jpg.webp',
      role: 'Girlfriend'
    },
    {
      type: 'therapist',
      name: 'Dr. Emily',
      description: 'Empathetic and supportive',
      image: 'https://assets.theinnerhour.com/bloguploads/shutterstock_21011328011667391753185.jpg',
      role: 'Therapist'
    },
    {
      type: 'friend',
      name: 'Raj',
      description: 'Casual and fun',
      image: 'https://static-cdn.toi-media.com/www/uploads/2024/08/E128C42A-7A30-42A4-B49E-DA2617B65249DSCF9042.jpeg',
      role: 'Friend'
    },
    {
      type: 'doctor',
      name: 'Dr. John',
      description: 'Knowledgeable and caring',
      image: 'https://png.pngtree.com/png-clipart/20231002/original/pngtree-young-afro-professional-doctor-png-image_13227671.png',
      role: 'Doctor'
    },
    {
      type: 'scientist',
      name: 'Dr. Sara',
      description: 'Logical and curious',
      image: 'https://images.ctfassets.net/cnu0m8re1exe/5z0hdZSE6gkeomcudrl1Kl/b089967c69232887e0121e9083210115/scientist.jpg',
      role: 'Scientist'
    },
    {
      type: 'counselor',
      name: 'Linda',
      description: 'Understanding and guiding',
      image: 'https://media.craiyon.com/2025-04-08/reOm_LVARq2sn3IGknAcVA.webp',
      role: 'Counselor'
    },
    {
      type: 'coach',
      name: 'Coach Mike',
      description: 'Motivational and energetic',
      image: 'https://cdn.pixabay.com/photo/2023/11/19/18/43/ai-generated-8399592_1280.png',
      role: 'Coach'
    },
    {
      type: 'parent',
      name: 'Mom',
      description: 'Nurturing and caring',
      image: 'https://img.etimg.com/thumb/width-1200,height-900,imgsize-25714,resizemode-75,msid-115961082/news/science/ai-mother-meet-kavya-mehra-indias-first-ai-mom-influencer.jpg',
      role: 'Parent'
    },
    {
      type: 'sister',
      name: 'Priya',
      description: 'Funny and relatable',
      image: 'https://cdn.goenhance.ai/user/2024/07/19/c0c1400b-abc2-4541-a849-a7e4f361d28d_0.jpg',
      role: 'Sister'
    },
    {
      type: 'boss',
      name: 'Mr. Smith',
      description: 'Supportive but firm',
      image: 'https://www.partysuppliesindia.com/cdn/shop/products/BOSSBABYTHEMECUTOUT-09-1.jpg?v=1735575729',
      role: 'Boss'
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
    <div className="min-h-screen bg-gray-50">
      {/* Modern Chat App Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-center space-x-3">
                {/* Chat Icon */}
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                
                {/* Title */}
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Pick Your AI Chat Buddy
                </h1>
              </div>
              
              {/* Subtitle with chat bubble design */}
              <div className="mt-3 flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-white/90 text-sm">
                    Start a conversation with your perfect AI companion
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {personas.map((persona) => (
            <div
              key={persona.type}
              onClick={() => handlePersonaSelect(persona.type)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                {/* Image Container with Fixed Aspect Ratio */}
                <div className="relative pt-[100%]">
                  <img
                    src={persona.image}
                    alt={persona.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        persona.name
                      )}&background=random&size=400`;
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {persona.name}
                    </h2>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {persona.role}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {persona.description}
                  </p>
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span className="group-hover:underline">Start chatting</span>
                    <svg
                      className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
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