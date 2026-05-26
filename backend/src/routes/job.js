import express from 'express';
import {
  createJob,
  getJobs,
  getMyCompanyJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  proposeToProvider,
  getMyProposals,
  getSentProposals,
  respondToProposal
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { validateJobCreation, validateMongoId } from '../middlewares/validation.js';

const router = express.Router();
router.post('/', protect, authorize('company', 'admin'), validateJobCreation, createJob);
router.get('/', getJobs);
router.get('/my-jobs', protect, authorize('company', 'admin'), getMyCompanyJobs);
router.get('/my-applications', protect, getMyApplications);
router.get('/my-proposals', protect, authorize('provider', 'admin'), getMyProposals);
router.get('/sent-proposals', protect, authorize('company', 'admin'), getSentProposals);
router.get('/:id', validateMongoId, getJobById);
router.put('/:id', protect, authorize('company', 'admin'), validateMongoId, updateJob);
router.delete('/:id', protect, authorize('company', 'admin'), validateMongoId, deleteJob);
router.post('/:id/apply', protect, authorize('provider', 'admin'), validateMongoId, applyToJob);
router.get('/:id/applications', protect, authorize('company', 'admin'), validateMongoId, getJobApplications);
router.put('/applications/:id', protect, authorize('company', 'admin'), validateMongoId, updateApplicationStatus);
router.post('/:id/propose', protect, authorize('company', 'admin'), validateMongoId, proposeToProvider);
router.put('/proposals/:id', protect, authorize('provider', 'admin'), validateMongoId, respondToProposal);

export default router;
