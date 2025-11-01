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

const {
  validateCreateRequest,
  validateAcceptRequest,
  validateRejectRequest,
  validateCancelRequest,
  validateReview,
  validateGetRequests,
  validateRequestId
} = require('../middleware/validation');

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO TEMPORÁRIO
// ========================================
const tempAuth = (req, res, next) => {
  // Pega o userId do header (simulando autenticação)
  const userId = req.headers['x-user-id'];
  const userType = req.headers['x-user-type'] || 'client';
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: '❌ Envie o header x-user-id com um ID válido de usuário'
    });
  }

  req.user = {
    id: userId,
    userType: userType
  };
  
  next();
};

// ========================================
// ROTAS
// ========================================

// Criar nova solicitação
router.post('/', 
  tempAuth,
  validateCreateRequest,
  createRequest
);

// Buscar minhas solicitações
router.get('/', 
  tempAuth,
  validateGetRequests,
  getMyRequests
);

// Buscar solicitação específica
router.get('/:id', 
  tempAuth,
  validateRequestId,
  getRequestById
);

// Aceitar solicitação (PRESTADOR)
router.put('/:id/accept', 
  tempAuth,
  validateAcceptRequest,
  acceptRequest
);

// Rejeitar solicitação (PRESTADOR)
router.put('/:id/reject', 
  tempAuth,
  validateRejectRequest,
  rejectRequest
);

// Iniciar trabalho (PRESTADOR)
router.put('/:id/start', 
  tempAuth,
  validateRequestId,
  startWork
);

// Concluir trabalho (PRESTADOR)
router.put('/:id/complete', 
  tempAuth,
  validateRequestId,
  completeWork
);

// Cancelar solicitação
router.put('/:id/cancel', 
  tempAuth,
  validateCancelRequest,
  cancelRequest
);

// Avaliar prestador
router.put('/:id/review-provider', 
  tempAuth,
  validateReview,
  reviewProvider
);

// Avaliar cliente
router.put('/:id/review-client', 
  tempAuth,
  validateReview,
  reviewClient
);

module.exports = router;