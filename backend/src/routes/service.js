import express from 'express';
import {
  createServiceRequest,
  getMyRequests,
  markMyRequestResponsesViewed,
  getReceivedServices,
  updateServiceStatus,
  reviewService
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validateMongoId, validateServiceRequest } from '../middlewares/validation.js';

const router = express.Router();

router.post('/', protect, validateServiceRequest, createServiceRequest);
router.get('/my-requests', protect, getMyRequests);
router.put('/my-requests/viewed', protect, markMyRequestResponsesViewed);
router.get('/received', protect, authorize('provider'), getReceivedServices);
router.put('/:id/status', protect, validateMongoId, updateServiceStatus);
router.post('/:id/review', protect, validateMongoId, reviewService);

export default router;
