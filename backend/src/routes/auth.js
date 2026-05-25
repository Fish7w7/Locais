// backend/src/routes/auth.js
import express from 'express';
import {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { 
  validateRegister, 
  validateLogin 
} from '../middlewares/validation.js';

const router = express.Router();

// Rotas públicas
router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Rotas protegidas
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

export default router;
