// backend/src/routes/review.js
import express from 'express';
import {
  createReview,
  getUserReviews,
  getPendingReviews,
  moderateReview,
  markHelpful,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

router.get('/user/:userId', getUserReviews);

router.post('/', protect, createReview);
router.post('/:id/helpful', protect, markHelpful);
router.delete('/:id', protect, deleteReview);

router.get('/pending', protect, adminOnly, getPendingReviews);
router.put('/:id/moderate', protect, adminOnly, moderateReview);

export default router;