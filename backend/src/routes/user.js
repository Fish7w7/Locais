// backend/src/routes/user.js
import express from 'express';
import {
  updateProfile,
  upgradeToProvider,
  updateProviderInfo,
  getProviders,
  getUserById,
  deactivateAccount,
  reactivateAccount,
  deleteAccount
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.post('/upgrade-to-provider', protect, authorize('client'), upgradeToProvider);
router.put('/provider-info', protect, authorize('provider'), updateProviderInfo);
router.get('/providers', getProviders);
router.get('/:id', getUserById);

// Gerenciamento de conta
router.put('/deactivate', protect, deactivateAccount);
router.post('/reactivate', reactivateAccount); // Público
router.delete('/delete-account', protect, deleteAccount);

export default router;