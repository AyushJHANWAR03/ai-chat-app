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
      image: 'https://res.cloudinary.com/jerrick/image/upload/d_642250b563292b35f27461a7.png,f_jpg,fl_progressive,q_auto,w_1024/67363257f3ab95001dd5daba.png',
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
      const selectedPersona = personas.find(p => p.type === personaType);
      localStorage.setItem("selectedPersona", JSON.stringify(selectedPersona));

      const response = await api.post(`/chat/${personaType}/start`);
      const sessionId = response.data._id;
      if (sessionId) navigate(`/chat/${sessionId}`, { replace: true });
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat session.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6 text-center">
              <h1 className="text-3xl font-bold text-white">Choose Your AI Persona</h1>
              <div className="mt-3 flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-white/90 text-sm">Pick someone to talk to—your mood, your vibe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Personas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {personas.map((persona) => (
            <div
              key={persona.type}
              onClick={() => handlePersonaSelect(persona.type)}
              className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg transition p-4 group"
            >
              <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                <img
                  src={persona.image}
                  alt={persona.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=random&size=400`;
                  }}
                />
              </div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{persona.name}</h2>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {persona.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{persona.description}</p>
                <p className="text-blue-600 text-sm font-medium mt-2 group-hover:underline">
                  Start chatting &rarr;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonasPage;