import express from 'express';
import { askFitnessBot } from '../controllers/chatbot.js';
const router = express.Router();
router.post('/', askFitnessBot);
export default router;