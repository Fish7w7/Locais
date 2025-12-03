import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  proposeToProvider,
  getMyProposals,
  respondToProposal
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.post('/', protect, authorize('company', 'admin'), createJob);
router.get('/', getJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/my-proposals', protect, authorize('provider', 'admin'), getMyProposals);
router.get('/:id', getJobById);
router.put('/:id', protect, authorize('company', 'admin'), updateJob);
router.delete('/:id', protect, authorize('company', 'admin'), deleteJob);
router.post('/:id/apply', protect, authorize('client', 'admin'), applyToJob);
router.get('/:id/applications', protect, authorize('company', 'admin'), getJobApplications);
router.put('/applications/:id', protect, authorize('company', 'admin'), updateApplicationStatus);
router.post('/:id/propose', protect, authorize('company', 'admin'), proposeToProvider);
router.put('/proposals/:id', protect, authorize('provider', 'admin'), respondToProposal);

export default router;