import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { isAuthenticated } from '../utils/auth';
import { FaArrowLeft } from 'react-icons/fa';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personaDetails, setPersonaDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!sessionId || initialLoaded) return;

    const init = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/chat/${sessionId}`);
        const sortedMessages = (data.messages || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(sortedMessages);

        const persona = getPersonaDetails();
        setPersonaDetails(persona);

        if (!sortedMessages.length && persona?.type) await sendFirstMessage(persona.type);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load chat session');
        navigate('/personas');
      }
      setInitialLoaded(true);
      setLoading(false);
    };

    init();
  }, [sessionId, initialLoaded, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPersonaDetails = () => {
    const stored = localStorage.getItem("selectedPersona");
    return stored ? JSON.parse(stored) : null;
  };

  const sendFirstMessage = async (personaType) => {
    try {
      setIsTyping(true);
      const { data } = await api.post(`/chat/${sessionId}/first-message`, { personaType });
      if (data?.content) {
        setMessages([{
          sender: 'ai',
          content: data.content,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to start conversation');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg = {
      sender: 'user',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const { data } = await api.post(`/chat/${sessionId}/message`, { content: newMessage });
      if (data?.content) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          content: data.content,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      toast.error('Message failed');
    } finally {
      setIsTyping(false);
    }
  };

  const handleBack = () => navigate('/personas');

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin border-t-4 border-blue-500 border-solid rounded-full h-12 w-12 mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button
          onClick={handleBack}
          className="mr-4 text-white text-2xl font-semibold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <img
          src={personaDetails?.image}
          alt="avatar"
          className="w-12 h-12 rounded-full mr-3 cursor-pointer"
          onClick={() => setShowImageModal(true)}
        />
        <div>
          <div className="font-bold text-lg">{personaDetails?.name}</div>
          <div className="text-sm text-white/70">{personaDetails?.description}</div>
        </div>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4">
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
              <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end`}>
                {!isUser && (
                  <img
                    src={personaDetails.image}
                    alt={personaDetails.name}
                    className="w-9 h-9 rounded-full mr-2 cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                  />
                )}
                <div
                  className={`group max-w-[75%] px-4 py-2.5 transition-shadow duration-200 hover:shadow-md
                    ${isUser
                      ? 'bg-blue-500 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                      : 'bg-white text-gray-800 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
                    }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-[11px] ${isUser ? 'text-white/80' : 'text-gray-500'} float-right ml-2 mt-1`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && <div className="text-left text-sm text-gray-500 italic mt-2">Typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex p-4 border-t bg-white">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="ml-3 bg-blue-500 text-white px-4 py-2 rounded-full">Send</button>
      </form>

      {/* Profile Photo Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={personaDetails.image}
              alt="Profile"
              className="w-52 h-52 rounded-full object-cover shadow-lg"
            />
            <button
              className="absolute top-0 right-0 bg-white text-black rounded-full p-1 mt-1 mr-1"
              onClick={() => setShowImageModal(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
