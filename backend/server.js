import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors'; // Reimportado para uso direto

// Middlewares de segurança
import { securityMiddlewares } from './src/config/security.js';
import { generalLimiter } from './src/middlewares/rateLimiter.js';

// Rotas
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import serviceRoutes from './src/routes/service.js';
import jobRoutes from './src/routes/job.js';
import adminRoutes from './src/routes/adminRoutes.js';
import reviewRoutes from './src/routes/review.js';
import chatRoutes from './src/routes/chat.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORREÇÃO DEFINITIVA DO CORS (APLICADO NO TOPO) ---
const allowedOrigins = [
  'http://localhost:5173', // Frontend principal
  'http://localhost:5174'  // Painel de Administração Dedicado
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); 
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Logar a tentativa de acesso não autorizado
      console.warn(`[CORS BLOQUEADO] Tentativa de acesso de origem não permitida: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, 
}));
// ------------------------------------------------------

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Aplicar os middlewares de segurança restantes (o CORS já foi aplicado)
// Importar os middlewares de segurança individuais do security.js
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

// 1. Rate Limiting: Proteção contra ataques de força bruta e DoS
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 minutos
  message: 'Muitas requisições a partir deste IP, tente novamente após 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 2. Helmet: Configuração de Headers de Segurança HTTP
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

// 3. Sanitização de dados NoSQL (Mongo Sanitize)
app.use(mongoSanitize({
  replaceWith: '_',
}));

// 4. Proteção contra XSS (XSS-Clean)
app.use(xss());

// 5. Prevenir HTTP Parameter Pollution (HPP)
app.use(hpp());

// MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  });

// Monitorar conexão
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro no MongoDB:', err);
});

// ROTAS
// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 API Serviços Locais',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Health check detalhado
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV
  };
  
  const status = mongoose.connection.readyState === 1 ? 200 : 503;
  res.status(status).json(health);
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);

// ERROR HANDLERS

// 404 Handler 
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    path: req.path
  });
});

// Error Handler Global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Este ${field} já está cadastrado`
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

// GRACEFUL SHUTDOWN

process.on('SIGTERM', async () => {
  console.log(' SIGTERM recebido, fechando servidor...');
  
  await mongoose.connection.close();
  console.log(' MongoDB desconectado');
  
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error(' Unhandled Rejection:', err);
  process.exit(1);
});

// START SERVER

app.listen(PORT, () => {
  console.log('\n================================');
  console.log(`   Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Rate Limiting: Ativo`);
  console.log(`🛡️  Segurança: Helmet + Sanitização`);
  console.log('================================\n');
});

export default app;
