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

router.post('/', protect, authorize('company'), createJob);
router.get('/', getJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/my-proposals', protect, authorize('provider'), getMyProposals);
router.get('/:id', getJobById);
router.put('/:id', protect, authorize('company'), updateJob);
router.delete('/:id', protect, authorize('company'), deleteJob);

router.post('/:id/apply', protect, authorize('client'), applyToJob);
router.get('/:id/applications', protect, authorize('company'), getJobApplications);
router.put('/applications/:id', protect, authorize('company'), updateApplicationStatus);

router.post('/:id/propose', protect, authorize('company'), proposeToProvider);
router.put('/proposals/:id', protect, authorize('provider'), respondToProposal);

export default router;
