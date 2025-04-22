import React from 'react';
import { useNavigate } from 'react-router-dom';

const PersonasPage = () => {
  const navigate = useNavigate();

  const personas = [
    { type: 'girlfriend', name: 'Girlfriend', description: 'A caring and supportive companion' },
    { type: 'therapist', name: 'Therapist', description: 'A professional guide for your thoughts' },
    { type: 'friend', name: 'Friend', description: 'A casual and fun conversation partner' }
  ];

  const handlePersonaSelect = (personaType) => {
    navigate(`/chat/${personaType}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Choose Your Chat Partner</h1>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona) => (
            <div
              key={persona.type}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handlePersonaSelect(persona.type)}
            >
              <h2 className="text-xl font-semibold mb-2">{persona.name}</h2>
              <p className="text-gray-600">{persona.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonasPage; 