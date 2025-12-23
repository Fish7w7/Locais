// backend/src/routes/adminRoutes.js
import express from 'express';
import { protect, adminOnly } from '../middlewares/auth.js';
import {
  createAdmin,
  getStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getContent,
  deleteContent,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';

const router = express.Router();

// Rota de inicialização (pode ser removida após o primeiro admin ser criado)
router.post('/create-admin', createAdmin);

// Todas as rotas abaixo exigem autenticação e permissão de administrador
router.use(protect);
router.use(adminOnly);

// Dashboard e Estatísticas
router.get('/stats', getStats);

// Gerenciamento de Usuários
router.route('/users')
  .get(getAllUsers); // Listar todos os usuários (com paginação/filtro)

router.route('/users/:id')
  .get(getUserById) // Obter detalhes de um usuário
  .put(updateUser) // Atualizar usuário
  .delete(deleteUser); // Deletar usuário

// Gerenciamento de Conteúdo (Serviços/Vagas)
router.route('/content')
  .get(getContent); // Listar conteúdo (com filtro por tipo)

router.route('/content/:id')
  .delete(deleteContent); // Deletar conteúdo (requer query param 'type')

// Gerenciamento de Configurações
router.route('/settings')
  .get(getSettings) // Obter configurações
  .put(updateSettings); // Atualizar configurações

export default router;