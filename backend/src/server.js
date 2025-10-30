// Carregar variáveis de ambiente PRIMEIRO
const path = require('path');
const dotenv = require('dotenv');

// Tentar carregar do diretório atual primeiro
const envPath = path.resolve(__dirname, '..', '.env');
console.log('📁 Procurando .env em:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Erro ao carregar .env:', result.error.message);
  process.exit(1);
}

// Verificar se MONGODB_URI foi carregada
if (!process.env.MONGODB_URI) {
  console.error('❌ ERRO: MONGODB_URI não foi carregada!');
  console.error('Verifique se o arquivo .env existe em:', path.join(__dirname, '../.env'));
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const connectDB = require('./config/database');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rotas
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Serviços Locais',
    version: '1.0.0',
    status: 'online'
  });
});

// TODO: Importar e usar rotas aqui
// app.use('/api/users', require('./routes/users'));
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/providers', require('./routes/providers'));
// app.use('/api/jobs', require('./routes/jobs'));
// app.use('/api/requests', require('./routes/requests'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});