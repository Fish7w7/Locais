import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const getNumberEnv = (name, fallback) => {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const safeReadMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const skipReadRequests = process.env.RATE_LIMIT_SKIP_READS !== 'false';

// Rate limiter geral. Por padrão, limita ações que alteram dados e deixa leituras/polling livres.
export const generalLimiter = rateLimit({ windowMs: getNumberEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  max: getNumberEnv('RATE_LIMIT_MAX', isProduction ? 500 : 2000),
  skip: (req) => skipReadRequests && safeReadMethods.has(req.method), message: {
    success: false,
    message: 'Muitas requisições. Aguarde um pouco e tente novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para autenticação - 5 tentativas por 15 minutos
export const authLimiter = rateLimit({ windowMs: getNumberEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  max: getNumberEnv('AUTH_RATE_LIMIT_MAX', isProduction ? 10 : 50),
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.'
  }
});

// Rate limiter para criação de recursos - 10 por hora
export const createLimiter = rateLimit({ windowMs: getNumberEnv('CREATE_RATE_LIMIT_WINDOW_MS', 60 * 60 * 1000),
  max: getNumberEnv('CREATE_RATE_LIMIT_MAX', isProduction ? 30 : 200),
  message: {
    success: false,
    message: 'Limite de criação atingido. Aguarde um pouco.'
  }
});

// Rate limiter estrito para rotas sensíveis - 3 por hora
export const strictLimiter = rateLimit({ windowMs: getNumberEnv('STRICT_RATE_LIMIT_WINDOW_MS', 60 * 60 * 1000),
  max: getNumberEnv('STRICT_RATE_LIMIT_MAX', isProduction ? 3 : 20),
  message: {
    success: false,
    message: 'Operação bloqueada temporariamente por segurança.'
  }
});
