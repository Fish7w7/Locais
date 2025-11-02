import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Rotas
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/user.js';
import serviceRoutes from './src/routes/service.js';
import jobRoutes from './src/routes/job.js';
import adminRoutes from './src/routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado com sucesso'))
  .catch((err) => console.error('❌ Erro ao conectar MongoDB:', err));

// Rotas
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API Serviços Locais',
    version: '1.0.0',
    status: 'online'
  });
});

// ⚠️ ROTA TEMPORÁRIA - REMOVER DEPOIS
app.delete('/api/dev/clear-users', async (req, res) => {
  try {
    const User = (await import('./src/models/User.js')).default;
    const result = await User.deleteMany({});
    res.json({ 
      success: true, 
      message: `${result.deletedCount} usuários deletados`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});


app.get('/api/dev/clear-users', async (req, res) => {
  try {
    const User = (await import('./src/models/User.js')).default;
    const result = await User.deleteMany({});
    res.json({ 
      success: true, 
      message: `${result.deletedCount} usuários deletados`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 Handler (DEVE SER O ÚLTIMO)
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Rota não encontrada' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
});