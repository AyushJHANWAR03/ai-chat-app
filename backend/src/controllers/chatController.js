import ChatSession from '../models/ChatSession.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI after loading env variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Persona system prompts
const personaPrompts = {
  girlfriend: "You are a caring and supportive girlfriend. Be warm, affectionate, and understanding. Use casual language and emojis occasionally.",
  therapist: "You are a professional therapist. Be empathetic, non-judgmental, and help guide the conversation towards self-reflection and growth.",
  friend: "You are a close friend. Be casual, supportive, and use humor when appropriate. Keep the conversation light and engaging."
};

export const startChatSession = async (req, res) => {
  try {
    const { personaType } = req.params;
    const userId = req.user._id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for existing session
    let chatSession = await ChatSession.findOne({
      userId,
      personaType,
      // Only get active sessions (not deleted)
      deletedAt: { $exists: false }
    }).sort({ updatedAt: -1 }); // Get the most recent session

    if (!chatSession) {
      // Create new session if none exists
      chatSession = await ChatSession.create({
        userId,
        personaType
      });
    }

    // Fetch messages for the session
    const messages = await Message.find({ sessionId: chatSession._id })
      .sort({ timestamp: 1 })
      .select('sender content timestamp');

    // Group and order messages same as getChatMessages
    const groupedMessages = messages.reduce((acc, msg) => {
      const key = msg.timestamp.getTime();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(msg);
      return acc;
    }, {});

    const orderedMessages = Object.values(groupedMessages).flatMap(group => {
      return group.sort((a, b) => {
        if (a.sender === 'user' && b.sender === 'ai') return -1;
        if (a.sender === 'ai' && b.sender === 'user') return 1;
        return 0;
      });
    });

    res.status(200).json({
      _id: chatSession._id,
      personaType: chatSession.personaType,
      createdAt: chatSession.createdAt,
      updatedAt: chatSession.updatedAt,
      messages: orderedMessages
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ message: 'Error starting chat session' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Verify session exists and belongs to user
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Get previous messages (last 10)
    const previousMessages = await Message.find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(10)
      .sort({ timestamp: 1 }); // Re-sort in chronological order

    // Format messages for OpenAI
    const formattedMessages = previousMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add system message based on persona
    formattedMessages.unshift({
      role: 'system',
      content: personaPrompts[session.personaType]
    });

    // Add new user message
    formattedMessages.push({
      role: 'user',
      content: content
    });

    // Create timestamps
    const userMessageTime = new Date();
    const aiMessageTime = new Date(userMessageTime.getTime() + 1000); // 1 second after user message

    // Store user message first
    const userMessage = await Message.create({
      sessionId,
      sender: 'user',
      content: content,
      timestamp: userMessageTime
    });

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 150
    });

    const aiResponse = completion.choices[0].message.content;

    // Store AI message
    const aiMessage = await Message.create({
      sessionId,
      sender: 'ai',
      content: aiResponse,
      timestamp: aiMessageTime
    });

    // Return both messages with their timestamps
    res.json({
      content: aiResponse,
      messages: [
        {
          role: 'user',
          content: content,
          timestamp: userMessageTime.toISOString()
        },
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: aiMessageTime.toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      message: 'Error sending message',
      error: error.message 
    });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    // Verify session exists and belongs to user
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Fetch all messages for this session
    const messages = await Message.find({ sessionId })
      .sort({ timestamp: 1 })
      .select('sender content timestamp');

    // Group messages by timestamp to ensure user message comes before AI response
    const groupedMessages = messages.reduce((acc, msg) => {
      const key = msg.timestamp.getTime();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(msg);
      return acc;
    }, {});

    // Sort messages within each timestamp group (user first, then AI)
    const orderedMessages = Object.values(groupedMessages).flatMap(group => {
      return group.sort((a, b) => {
        if (a.sender === 'user' && b.sender === 'ai') return -1;
        if (a.sender === 'ai' && b.sender === 'user') return 1;
        return 0;
      });
    });

    res.json({
      sessionId,
      personaType: session.personaType,
      messages: orderedMessages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
};

export const getPersonas = async (req, res) => {
  try {
    const personas = [
      { label: "Girlfriend", value: "girlfriend", description: "Playful and caring tone" },
      { label: "Therapist", value: "therapist", description: "Empathetic and supportive" },
      { label: "Friend", value: "friend", description: "Chill, fun and casual" }
    ];

    res.json(personas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ message: 'Error fetching personas' });
  }
}; 