import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { startChatSession, sendMessage, getChatMessages, getPersonas } from '../controllers/chatController.js';

const router = express.Router();

router.get('/personas', protect, getPersonas);
router.post('/:personaType/start', protect, startChatSession);
router.post('/:sessionId/message', protect, sendMessage);
router.get('/:sessionId', protect, getChatMessages);

export default router; 