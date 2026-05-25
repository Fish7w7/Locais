import express from 'express';
import { getNotificationSummary } from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/summary', protect, getNotificationSummary);

export default router;
