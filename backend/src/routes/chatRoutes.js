import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { startChatSession, sendMessage, getChatMessages, getPersonas, sendFirstMessage } from '../controllers/chatController.js';

const router = express.Router();

router.get('/personas', protect, getPersonas);
router.post('/:personaType/start', protect, startChatSession);
router.post('/:sessionId/message', protect, sendMessage);
router.get('/:sessionId', protect, getChatMessages);
router.post('/:sessionId/first-message', protect, sendFirstMessage);

export default router; 