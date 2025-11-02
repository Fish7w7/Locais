import express from 'express';
import {
  createServiceRequest,
  getMyRequests,
  getReceivedServices,
  updateServiceStatus,
  reviewService
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, createServiceRequest);
router.get('/my-requests', protect, getMyRequests);
router.get('/received', protect, authorize('provider'), getReceivedServices);
router.put('/:id/status', protect, updateServiceStatus);
router.post('/:id/review', protect, reviewService);

export default router;