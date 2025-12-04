// backend/src/routes/chat.js
import express from 'express';
import {
  createOrGetConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage
} from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.post('/conversation', createOrGetConversation);
router.get('/conversations', getMyConversations);
router.get('/conversations/:id/messages', getConversationMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;