// backend/src/config/security.js
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

export const securityMiddlewares = (app) => {
  // Helmet - Configuração de headers de segurança
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Sanitização de dados NoSQL
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️ Tentativa de NoSQL Injection detectada: ${key}`);
    }
  }));

  // Proteção contra XSS
  app.use(xss());

  // Prevenir parameter pollution
  app.use((req, res, next) => {
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (Array.isArray(req.query[key])) {
          req.query[key] = req.query[key][0];
        }
      });
    }
    next();
  });

  // Headers de segurança adicionais
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Logging de tentativas suspeitas
  app.use((req, res, next) => {
    const suspiciousPatterns = [
      /(\.|<|>|'|"|;|\$|{|})/g,
      /union.*select/i,
      /<script>/i,
      /javascript:/i
    ];

    const checkSuspicious = (obj) => {
      if (!obj) return false;
      const str = JSON.stringify(obj);
      return suspiciousPatterns.some(pattern => pattern.test(str));
    };

    if (checkSuspicious(req.body) || checkSuspicious(req.query)) {
      console.warn('🚨 ATIVIDADE SUSPEITA DETECTADA:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }

    next();
  });
};