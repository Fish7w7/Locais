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

// Aplicar rate limiting
router.use(authLimiter);

// Rotas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Rotas protegidas
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

export default router;