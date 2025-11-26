// backend/src/routes/admin.js - VERSÃO ATUALIZADA COM SEGURANÇA
import express from 'express';
import {
  createAdmin,
  getAllUsers,
  getStats,
  deleteUser,
  updateUser
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/auth.js';
import { devOnly } from '../middlewares/devOnly.js';
import { strictLimiter } from '../middlewares/rateLimiter.js';
import { validateMongoId } from '../middlewares/validation.js';

const router = express.Router();

// Apenas desenvolvimento
// Esta rota DEVE ser removida ou protegida em produção
router.post('/create-admin', devOnly, strictLimiter, createAdmin);

// Rotas protegidas (apenas admin)
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/stats', protect, adminOnly, getStats);
router.delete('/users/:id', protect, adminOnly, validateMongoId, deleteUser);
router.put('/users/:id', protect, adminOnly, validateMongoId, updateUser);

export default router;