// backend/src/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Rate limiter geral - 100 requisições por 15 minutos
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    message: '⏱️ Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para autenticação - 5 tentativas por 15 minutos
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  message: {
    success: false,
    message: '🔒 Muitas tentativas de login. Aguarde 15 minutos e tente novamente.'
  }
});

// Rate limiter para criação de recursos - 10 por hora
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: {
    success: false,
    message: '⚠️ Limite de criação atingido. Aguarde 1 hora.'
  }
});

// Rate limiter estrito para rotas sensíveis - 3 por hora
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: '🛑 Operação bloqueada temporariamente por segurança.'
  }
});