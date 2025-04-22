import express from 'express';
import { googleLogin } from '../controllers/authController.js';

const router = express.Router();

// Google authentication route
router.post('/google', googleLogin);

export default router; 