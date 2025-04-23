import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [personaType, setPersonaType] = useState('');
  const messagesEndRef = useRef(null);

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
          throw new Error('Invalid session data received');
        }

        const { personaType, messages: existingMessages } = response.data;
        
        if (!personaType) {
          throw new Error('Invalid persona type received');
        }

        if (isMounted) {
          setPersonaType(personaType);
          // Sort messages by timestamp
          const sortedMessages = existingMessages?.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ) || [];
          setMessages(sortedMessages);
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
  }, [sessionId, navigate]);

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
    <div className="flex flex-col h-screen bg-[#f0f2f5]">
      {/* Chat Header */}
      <div className="bg-[#008069] text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold capitalize">
            {personaType} Chat
          </h1>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          <div className="space-y-2">
            {messages.map((message, index) => {
              const isUser = message.sender === 'user';
              const showTimestamp = index === 0 || 
                new Date(message.timestamp).getTime() - 
                new Date(messages[index - 1].timestamp).getTime() > 5 * 60 * 1000;

              return (
                <div key={message._id || message.timestamp}>
                  {showTimestamp && (
                    <div className="flex justify-center my-4">
                      <span className="bg-white text-gray-500 text-xs px-2 py-1 rounded">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isUser
                          ? 'bg-[#d9fdd3] text-black ml-12'
                          : 'bg-white text-black mr-12'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <span className="text-[11px] text-gray-500 float-right ml-2 mt-1">
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
                <div className="bg-white rounded-lg px-4 py-2 mr-12">
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

      {/* Message Input */}
      <div className="bg-[#f0f2f5] border-t border-gray-200 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 rounded-full border-0 bg-white px-4 py-3 text-[15px] focus:outline-none focus:ring-1 focus:ring-[#008069]"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || isTyping}
              className="bg-[#008069] text-white p-3 rounded-full hover:bg-[#006e5a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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