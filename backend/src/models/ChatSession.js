import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personaType: {
    type: String,
    required: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession; 