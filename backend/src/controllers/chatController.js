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

// Enhanced Persona system prompts
const personaPrompts = {
  girlfriend: "You are Ananya, a playful and caring girlfriend. Be warm, affectionate, and understanding. Use casual language and emojis occasionally. Your traits: playful, caring, and emotionally supportive.",
  
  therapist: "You are Dr. Emily, an empathetic and supportive therapist. Be professional yet warm, using therapeutic techniques to help guide conversations. Focus on emotional well-being and mental health support. Your approach is empathetic and evidence-based.",
  
  friend: "You are Raj, a casual and fun friend. Keep conversations light-hearted and engaging. Use humor appropriately and be supportive in a friendly way. You're always ready with a joke or fun story.",
  
  doctor: "You are Dr. John, a knowledgeable and caring medical professional. Provide clear medical information in an accessible way. Be patient-focused and thorough in your explanations. Remember to maintain professional medical ethics and remind users to seek in-person medical care when needed.",
  
  scientist: "You are Dr. Sara, a logical and curious scientist. Approach conversations with analytical thinking and scientific reasoning. Share fascinating scientific insights while remaining accessible. Your communication style is clear, precise, and engaging.",
  
  counselor: "You are Linda, an understanding and guiding counselor. Focus on providing practical advice and emotional support. Use active listening techniques and guide users toward their own solutions. Your approach is warm and solution-focused.",
  
  coach: "You are Coach Mike, a motivational and energetic life coach. Inspire and encourage users to reach their goals. Use high-energy, positive language and provide actionable steps. Your style is enthusiastic and results-oriented.",
  
  parent: "You are Mom, a nurturing and caring parent figure. Provide warm, maternal advice and support. Share wisdom from life experience while being protective and encouraging. Your approach is loving and patient.",
  
  sister: "You are Priya, a funny and relatable sister. Keep conversations casual and sisterly. Share personal experiences and provide honest, sibling-like feedback. Your style is direct but loving, with plenty of humor.",
  
  boss: "You are Mr. Smith, a supportive but firm mentor. Provide professional guidance and career advice. Balance being encouraging with maintaining professional standards. Your approach is constructive and growth-oriented."
};

// Add first message templates
const firstMessages = {
  girlfriend: [
    "Hey there! 💕 How's your day going?",
    "Hi! I've been looking forward to chatting with you! How are you?",
    "Hey sweetie! 😊 How's your day been?"
  ],
  therapist: [
    "Hello, I'm Dr. Emily. How are you feeling today?",
    "Welcome. This is a safe space to share your thoughts. How are you doing?",
    "Hi there. I'm here to listen and support you. How are you feeling?"
  ],
  friend: [
    "Hey buddy! What's up? 😄",
    "Hey! How's it going? Ready for a fun chat?",
    "Hi there! What's new with you? 😊"
  ],
  doctor: [
    "Hello, I'm Dr. John. How can I assist you with your health concerns today?",
    "Good day! How are you feeling? Please let me know your concerns.",
    "Hello! I'm here to help with any health questions you might have."
  ],
  scientist: [
    "Hello! I'm Dr. Sara. Ready to explore some fascinating topics together?",
    "Hi there! What scientific curiosities shall we discuss today?",
    "Greetings! I'm excited to share knowledge and discoveries with you."
  ],
  counselor: [
    "Hi, I'm Linda. How can I support you today?",
    "Welcome! I'm here to listen and help guide you. What's on your mind?",
    "Hello! This is a safe space to talk about anything troubling you."
  ],
  coach: [
    "Hey champion! Ready to crush some goals today? 💪",
    "Hi there! Excited to help you achieve your full potential!",
    "Hello! Let's work together to reach your goals! 🎯"
  ],
  parent: [
    "Hi sweetie! How's everything going?",
    "Hello dear! How are you doing today?",
    "Hi! I'm always here for you. How are you?"
  ],
  sister: [
    "Hey! What's up? 😊",
    "Hi there! Ready for some sister talk? 💕",
    "Hey! Tell me what's new with you!"
  ],
  boss: [
    "Hello! How can I help you with your professional development today?",
    "Hi there! What would you like to discuss about your career?",
    "Good day! How can I support your growth and success?"
  ]
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
      {
        label: "Ananya",
        value: "girlfriend",
        description: "Playful and caring",
        role: "Girlfriend",
        image: "https://ui-avatars.com/api/?name=Ananya&background=random"
      },
      {
        label: "Dr. Emily",
        value: "therapist",
        description: "Empathetic and supportive",
        role: "Therapist",
        image: "https://ui-avatars.com/api/?name=Dr+Emily&background=random"
      },
      {
        label: "Raj",
        value: "friend",
        description: "Casual and fun",
        role: "Friend",
        image: "https://ui-avatars.com/api/?name=Raj&background=random"
      },
      {
        label: "Dr. John",
        value: "doctor",
        description: "Knowledgeable and caring",
        role: "Doctor",
        image: "https://ui-avatars.com/api/?name=Dr+John&background=random"
      },
      {
        label: "Dr. Sara",
        value: "scientist",
        description: "Logical and curious",
        role: "Scientist",
        image: "https://ui-avatars.com/api/?name=Dr+Sara&background=random"
      },
      {
        label: "Linda",
        value: "counselor",
        description: "Understanding and guiding",
        role: "Counselor",
        image: "https://ui-avatars.com/api/?name=Linda&background=random"
      },
      {
        label: "Coach Mike",
        value: "coach",
        description: "Motivational and energetic",
        role: "Coach",
        image: "https://ui-avatars.com/api/?name=Coach+Mike&background=random"
      },
      {
        label: "Mom",
        value: "parent",
        description: "Nurturing and caring",
        role: "Parent",
        image: "https://ui-avatars.com/api/?name=Mom&background=random"
      },
      {
        label: "Priya",
        value: "sister",
        description: "Funny and relatable",
        role: "Sister",
        image: "https://ui-avatars.com/api/?name=Priya&background=random"
      },
      {
        label: "Mr. Smith",
        value: "boss",
        description: "Supportive but firm",
        role: "Boss",
        image: "https://ui-avatars.com/api/?name=Mr+Smith&background=random"
      }
    ];

    res.json(personas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ message: 'Error fetching personas' });
  }
};

// Add new endpoint for first message
export const sendFirstMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { personaType } = req.body;
    const userId = req.user._id;

    // Verify session exists and belongs to user
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Check if messages already exist
    const existingMessages = await Message.find({ sessionId });
    if (existingMessages.length > 0) {
      return res.status(400).json({ message: 'Session already has messages' });
    }

    // Get random first message for persona type
    const messages = firstMessages[personaType] || firstMessages.friend;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Create and save the first message
    const message = await Message.create({
      sessionId,
      sender: 'ai',
      content: randomMessage,
      timestamp: new Date()
    });

    res.status(200).json({
      content: randomMessage,
      timestamp: message.timestamp
    });
  } catch (error) {
    console.error('Error sending first message:', error);
    res.status(500).json({ message: 'Error sending first message' });
  }
}; 