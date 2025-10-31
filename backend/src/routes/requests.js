// SERVICE REQUEST ROUTES

const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getRequestById,
  acceptRequest,
  rejectRequest,
  startWork,
  completeWork,
  cancelRequest,
  reviewProvider,
  reviewClient
} = require('../controllers/serviceRequestController');

// Middleware de autenticação (será implementado depois)
// const { protect } = require('../middleware/auth');

// Middleware temporário (REMOVER quando auth estiver pronto)
const tempAuth = (req, res, next) => {
  // Simulando usuário logado
  req.user = {
    id: '507f1f77bcf86cd799439011', // ID fictício
    userType: 'client'
  };
  next();
};


// ROTAS PÚBLICAS (nenhuma por enquanto)



// ROTAS PRIVADAS (requerem autenticação)


// Criar nova solicitação
router.post('/', tempAuth, createRequest);

// Buscar minhas solicitações (recebidas ou enviadas)
router.get('/', tempAuth, getMyRequests);

// Buscar solicitação específica
router.get('/:id', tempAuth, getRequestById);

// AÇÕES DO PRESTADOR

// Aceitar solicitação
router.put('/:id/accept', tempAuth, acceptRequest);

// Rejeitar solicitação
router.put('/:id/reject', tempAuth, rejectRequest);

// Iniciar trabalho
router.put('/:id/start', tempAuth, startWork);

// Concluir trabalho
router.put('/:id/complete', tempAuth, completeWork);

// AÇÕES COMPARTILHADAS

// Cancelar solicitação (requester ou provider)
router.put('/:id/cancel', tempAuth, cancelRequest);

// AVALIAÇÕES

// Cliente/Empresa avalia prestador
router.put('/:id/review-provider', tempAuth, reviewProvider);

// Prestador avalia cliente
router.put('/:id/review-client', tempAuth, reviewClient);

module.exports = router;