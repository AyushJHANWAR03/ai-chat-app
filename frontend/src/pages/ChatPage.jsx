import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { isAuthenticated } from '../utils/auth';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [personaType, setPersonaType] = useState('');
  const messagesEndRef = useRef(null);

  // Add persona details state
  const [personaDetails, setPersonaDetails] = useState({
    name: '',
    image: '',
    description: ''
  });

  // Add state for tracking first message status
  const [isFirstMessageSent, setIsFirstMessageSent] = useState(false);

  // Check authentication on mount and route changes
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
  }, [navigate]);

  // Handle back button and manual URL changes
  useEffect(() => {
    const handlePopState = (event) => {
      if (isAuthenticated()) {
        navigate('/personas');
      } else {
        navigate('/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // Initialize chat session and fetch messages
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (!sessionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(`/chat/${sessionId}`);
        
        if (!response.data) {
          throw new Error('Invalid session data');
        }

        const { personaType, messages: existingMessages } = response.data;
        
        if (!personaType) {
          throw new Error('Invalid persona type');
        }

        // Fetch persona details
        const personaData = {
          girlfriend: { name: 'Ananya', description: 'Playful and caring' },
          therapist: { name: 'Dr. Emily', description: 'Empathetic and supportive' },
          friend: { name: 'Raj', description: 'Casual and fun' },
          doctor: { name: 'Dr. John', description: 'Knowledgeable and caring' },
          scientist: { name: 'Dr. Sara', description: 'Logical and curious' },
          counselor: { name: 'Linda', description: 'Understanding and guiding' },
          coach: { name: 'Coach Mike', description: 'Motivational and energetic' },
          parent: { name: 'Mom', description: 'Nurturing and caring' },
          sister: { name: 'Priya', description: 'Funny and relatable' },
          boss: { name: 'Mr. Smith', description: 'Supportive but firm' }
        }[personaType];

        if (isMounted) {
          setPersonaType(personaType);
          setPersonaDetails({
            ...personaData,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(personaData.name)}&background=random&size=128`
          });
          const sortedMessages = existingMessages?.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ) || [];
          setMessages(sortedMessages);

          // Check if messages array is empty and first message hasn't been sent
          if (sortedMessages.length === 0 && !isFirstMessageSent) {
            sendFirstMessage(personaType);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (isMounted) {
          toast.error(error.response?.data?.message || 'Failed to load chat session');
          navigate('/personas', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();
    return () => {
      isMounted = false;
    };
  }, [sessionId, navigate, isFirstMessageSent]);

  // Add function to send first message
  const sendFirstMessage = async (personaType) => {
    try {
      setIsTyping(true);
      
      const response = await api.post(`/chat/${sessionId}/first-message`, {
        personaType
      });

      if (!response.data || !response.data.content) {
        throw new Error('Invalid response from server');
      }

      setMessages([{
        sender: 'ai',
        content: response.data.content,
        timestamp: new Date().toISOString()
      }]);

      setIsFirstMessageSent(true);
    } catch (error) {
      console.error('Error sending first message:', error);
      toast.error('Failed to start conversation');
    } finally {
      setIsTyping(false);
    }
  };

  const handleBack = () => {
    if (isAuthenticated()) {
      navigate('/personas');
    } else {
      navigate('/login');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId) return;

    const currentTime = new Date().toISOString();
    try {
      setIsTyping(true);
      const userMessage = {
        sender: 'user',
        content: newMessage,
        timestamp: currentTime
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');

      const response = await api.post(`/chat/${sessionId}/message`, {
        content: newMessage
      });

      if (!response.data || !response.data.content) {
        throw new Error('Invalid response from server');
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        content: response.data.content,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      setMessages(prev => prev.filter(msg => msg.timestamp !== currentTime));
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Modern Chat Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center px-4 py-3 space-x-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3 flex-1">
              <img
                src={personaDetails.image}
                alt={personaDetails.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
              />
              <div>
                <h1 className="text-lg font-semibold">{personaDetails.name}</h1>
                <p className="text-sm text-white/80">{personaDetails.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area with Enhanced Styling */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          <div className="space-y-3">
            {messages.map((message, index) => {
              const isUser = message.sender === 'user';
              const showTimestamp = index === 0 || 
                new Date(message.timestamp).getTime() - 
                new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000;

              return (
                <div key={message._id || message.timestamp}>
                  {showTimestamp && (
                    <div className="flex justify-center my-4">
                      <span className="bg-white/80 backdrop-blur-sm text-gray-500 text-xs px-3 py-1 rounded-full shadow-sm">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div 
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    {!isUser && (
                      <img
                        src={personaDetails.image}
                        alt={personaDetails.name}
                        className="w-8 h-8 rounded-full mr-2 self-end"
                      />
                    )}
                    <div
                      className={`group max-w-[75%] rounded-2xl px-4 py-2.5 transition-shadow duration-200 hover:shadow-md
                        ${isUser
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none'
                        }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <span className={`text-[11px] ${isUser ? 'text-white/80' : 'text-gray-500'} float-right ml-2 mt-1`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <img
                  src={personaDetails.image}
                  alt={personaDetails.name}
                  className="w-8 h-8 rounded-full mr-2 self-end"
                />
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Enhanced Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isTyping}
              className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 
                disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 