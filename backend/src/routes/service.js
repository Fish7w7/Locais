import express from 'express';
import {
  createServiceRequest,
  getMyRequests,
  markMyRequestResponsesViewed,
  getReceivedServices,
  updateServiceStatus,
  suggestServiceChange,
  respondToNegotiation,
  openServiceDispute,
  getServiceDisputes,
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
router.post('/:id/suggest-change', protect, authorize('provider'), validateMongoId, suggestServiceChange);
router.put('/:id/negotiation', protect, validateMongoId, respondToNegotiation);
router.post('/:id/dispute', protect, validateMongoId, openServiceDispute);
router.get('/:id/disputes', protect, validateMongoId, getServiceDisputes);
router.post('/:id/review', protect, validateMongoId, reviewService);

export default router;
