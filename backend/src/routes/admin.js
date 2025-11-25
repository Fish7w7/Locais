import express from 'express';
import {
  createAdmin,
  getAllUsers,
  getStats,
  deleteUser,
  updateUser
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Rota pública para criar admin (apenas desenvolvimento)
router.post('/create-admin', createAdmin);

// Rotas protegidas (apenas admin)
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/stats', protect, adminOnly, getStats);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id', protect, adminOnly, updateUser);


export default router;