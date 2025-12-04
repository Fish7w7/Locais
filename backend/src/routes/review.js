import express from 'express';
import {
  createReview,
  getUserReviews,
  getFlaggedReviews,
  moderateReview,
  markHelpful,
  deleteReview,
  reportReview 
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Públicas
router.get('/user/:userId', getUserReviews);

// Privadas
router.post('/', protect, createReview);
router.post('/:id/report', protect, reportReview); 
router.post('/:id/helpful', protect, markHelpful);
router.delete('/:id', protect, deleteReview);

// Admin
router.get('/flagged', protect, adminOnly, getFlaggedReviews); 
router.put('/:id/moderate', protect, adminOnly, moderateReview);

export default router;