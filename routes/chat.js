import express from 'express';
import { protect } from '../middlewares/auth.js';
import { sendMessage, getConversations, getMessages, getOrCreateConversation, getCoach } from '../controllers/chat.js';

const router = express.Router();

router.use(protect);

router.get('/coach', getCoach);
router.post('/send/:receiverId', sendMessage);
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.get('/with/:userId', getOrCreateConversation);

export default router;