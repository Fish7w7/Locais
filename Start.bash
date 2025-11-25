#!/bin/bash

# 🚀 QUICK START - Serviços Locais
# Execute este arquivo para iniciar o projeto completo

echo "🚀 Iniciando Projeto Serviços Locais..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null
then
    echo "❌ Node.js não encontrado. Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"
echo ""

# ====================================
# BACKEND
# ====================================
echo "📦 Configurando Backend..."
cd backend || exit

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Criando .env de exemplo..."
    cat > .env << EOF
# MongoDB - SUBSTITUA com sua connection string
MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster.mongodb.net/servicos-locais?retryWrites=true&w=majority

# JWT - MUDE para uma chave secreta forte
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
EOF
    echo "✅ Arquivo .env criado! EDITE-O com suas configurações MongoDB antes de continuar."
    echo "   Arquivo localizado em: backend/.env"
    echo ""
    echo "Pressione Enter depois de editar o .env..."
    read -r
fi

# Instalar dependências do backend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    npm install
    echo "✅ Dependências do backend instaladas"
else
    echo "✅ Dependências do backend já instaladas"
fi

echo ""
echo "🔥 Iniciando servidor backend em outra janela..."
echo "   Backend rodará em: http://localhost:5000"
echo ""

# Iniciar backend em background
npm run dev &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 3

# ====================================
# FRONTEND
# ====================================
echo ""
echo "📦 Configurando Frontend..."
cd ../frontend || exit

# Instalar dependências do frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
    echo "✅ Dependências do frontend instaladas"
else
    echo "✅ Dependências do frontend já instaladas"
fi

echo ""
echo "🎨 Iniciando aplicação frontend..."
echo "   Frontend rodará em: http://localhost:5173"
echo ""

# Iniciar frontend
npm run dev &
FRONTEND_PID=$!

# ====================================
# FINALIZACAO
# ====================================
echo ""
echo "✅ PROJETO INICIADO COM SUCESSO!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 Backend:  http://localhost:5000"
echo "📍 Frontend: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Próximos Passos:"
echo "1. Acesse: http://localhost:5173/setup-admin"
echo "2. Crie sua conta admin"
echo "3. Faça login e comece a usar!"
echo ""
echo "Para parar os servidores: Ctrl+C"
echo ""

# Aguardar Ctrl+C
wait $BACKEND_PID $FRONTEND_PID