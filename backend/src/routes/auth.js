// backend/src/routes/auth.js - VERSÃO ATUALIZADA
import express from 'express';
import {
  register,
  login,
  getMe,
  updatePassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { 
  validateRegister, 
  validateLogin 
} from '../middlewares/validation.js';

const router = express.Router();

// Aplicar rate limiting em todas as rotas de autenticação
router.use(authLimiter);

// Rotas públicas com validação
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Rotas protegidas
router.get('/me', protect, getMe);
router.put('/updatepassword', protect, updatePassword);

export default router;