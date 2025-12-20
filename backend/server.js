import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';

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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL, 
  process.env.ADMIN_PANEL_URL 
].filter(Boolean); 

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[CORS BLOQUEADO] Origem não permitida: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Aplicar os middlewares de segurança restantes
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

//Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: 'Muitas requisições a partir deste IP, tente novamente após 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

//Helmet
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
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  xssFilter: false, 
}));

//Sanitização NoSQL
app.use(mongoSanitize({
  replaceWith: '_',
}));

//XSS Protection
app.use(xss());

//HPP
app.use(hpp());

// MONGODB CONNECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado com sucesso');
    console.log(`Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  });

// Monitorar conexão
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('Erro no MongoDB:', err);
});

// ROTAS
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'API Serviços Locais',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

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
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Erro:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `Este ${field} já está cadastrado`
    });
  }

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
  console.log('SIGTERM recebido, fechando servidor...');
  await mongoose.connection.close();
  console.log('MongoDB desconectado');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// START SERVER
app.listen(PORT, () => {
  console.log('\n================================');
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Rate Limiting: Ativo`);
  console.log(`🛡️  Segurança: Helmet + Sanitização`);
  console.log(`🌐 CORS: Configurado para ${allowedOrigins.length} origens`);
  console.log('================================\n');
});

export default app;