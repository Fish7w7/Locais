// backend/src/config/security.js
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

export const securityMiddlewares = (app) => {
  const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000, 
    message: 'Muitas requisições a partir deste IP, tente novamente após 15 minutos.',
    standardHeaders: true, 
    legacyHeaders: false, 
  });
  app.use(limiter);

  // Helmet: Configuração de Headers de Segurança HTTP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https:", "http:"], 
        scriptSrc: ["'self'", "https:", "http:"],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", "https:", "http:"],
        fontSrc: ["'self'", "https:", "http:", 'data:'],
      },
    },
    crossOriginEmbedderPolicy: true, 
    crossOriginResourcePolicy: { policy: "cross-origin" },
    xssFilter: false, 
  }));

  // Sanitização de dados NoSQL
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`[SEGURANÇA] Tentativa de NoSQL Injection detectada e sanitizada na chave: ${key}`);
    }
  }));

  // Proteção contra XSS 
  app.use(xss());

  // HPP
  app.use(hpp());

  // CORS 
  app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  }));

  // Middleware de Logging de Segurança (Simplificado)
  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
    }
    next();
  });
};
