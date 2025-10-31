const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '..', '.env');
console.log('📁 Procurando .env em:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Erro ao carregar .env:', result.error.message);
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('❌ ERRO: MONGODB_URI não foi carregada!');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/database');

const app = express();

connectDB();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ 
    message: 'API Serviços Locais',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      requests: '/api/requests',
      users: '/api/users',
      providers: '/api/users/providers'
    }
  });
});

// ROTAS
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));

// 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 ================================');
  console.log('');
  console.log('📡 Endpoints disponíveis:');
  console.log(`   GET    /api/users/providers    - Listar prestadores`);
  console.log(`   GET    /api/requests           - Listar solicitações`);
  console.log(`   POST   /api/requests           - Criar solicitação`);
  console.log(`   GET    /api/requests/:id       - Ver detalhes`);
  console.log(`   PUT    /api/requests/:id/accept     - Aceitar`);
  console.log(`   PUT    /api/requests/:id/reject     - Rejeitar`);
  console.log(`   PUT    /api/requests/:id/start      - Iniciar`);
  console.log(`   PUT    /api/requests/:id/complete   - Concluir`);
  console.log(`   PUT    /api/requests/:id/cancel     - Cancelar`);
  console.log('');
});