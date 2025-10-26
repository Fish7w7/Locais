# ============================================
# SETUP FRONTEND - React App (PowerShell)
# ============================================

Write-Host "🎨 Configurando Frontend React..." -ForegroundColor Cyan

# Criar pasta frontend se não existir
if (!(Test-Path "frontend")) {
    New-Item -ItemType Directory -Path "frontend" | Out-Null
}

Set-Location "frontend"

# ============================================
# 1. CRIAR PACKAGE.JSON
# ============================================

Write-Host "📦 Criando package.json..." -ForegroundColor Yellow

@'
{
  "name": "servicos-locais-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
'@ | Out-File -FilePath "package.json" -Encoding UTF8

# ============================================
# 2. CRIAR .ENV
# ============================================

Write-Host "🔧 Criando .env..." -ForegroundColor Yellow

@'
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_UPLOAD_URL=http://localhost:3000/uploads
'@ | Out-File -FilePath ".env" -Encoding UTF8

# ============================================
# 3. CRIAR PUBLIC/INDEX.HTML
# ============================================

Write-Host "📄 Criando arquivos public..." -ForegroundColor Yellow

if (!(Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
}

@'
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <meta name="theme-color" content="#3b82f6" />
    <meta name="description" content="App de Serviços Locais - Conectando clientes, prestadores e empresas" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Serviços Locais</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>Você precisa habilitar JavaScript para rodar este app.</noscript>
    <div id="root"></div>
  </body>
</html>
'@ | Out-File -FilePath "public/index.html" -Encoding UTF8

# ============================================
# 4. CRIAR PUBLIC/MANIFEST.JSON
# ============================================

@'
{
  "short_name": "Serviços Locais",
  "name": "App de Serviços Locais",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff"
}
'@ | Out-File -FilePath "public/manifest.json" -Encoding UTF8

# ============================================
# 5. CRIAR SRC/INDEX.JS
# ============================================

Write-Host "⚛️ Criando arquivos src..." -ForegroundColor Yellow

if (!(Test-Path "src")) {
    New-Item -ItemType Directory -Path "src" | Out-Null
}

@'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@ | Out-File -FilePath "src/index.js" -Encoding UTF8

# ============================================
# 6. CRIAR SRC/INDEX.CSS
# ============================================

@'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f9fafb;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
'@ | Out-File -FilePath "src/index.css" -Encoding UTF8

# ============================================
# 7. BAIXAR APP.JS DA URL
# ============================================

Write-Host "📱 Criando App.js placeholder..." -ForegroundColor Yellow

@'
import React from 'react';

const App = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>⚠️ IMPORTANTE!</h1>
      <p>Copie o código completo do App.js do documento fornecido.</p>
      <p>Este é apenas um placeholder.</p>
    </div>
  );
};

export default App;
'@ | Out-File -FilePath "src/App.js" -Encoding UTF8

# ============================================
# FINALIZAÇÃO
# ============================================

Write-Host ""
Write-Host "✅ Estrutura do Frontend criada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Arquivos criados:" -ForegroundColor Cyan
Write-Host "   ✓ package.json" -ForegroundColor Green
Write-Host "   ✓ .env" -ForegroundColor Green
Write-Host "   ✓ public/index.html" -ForegroundColor Green
Write-Host "   ✓ public/manifest.json" -ForegroundColor Green
Write-Host "   ✓ src/index.js" -ForegroundColor Green
Write-Host "   ✓ src/index.css" -ForegroundColor Green
Write-Host "   ✓ src/App.js (placeholder)" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  AÇÃO NECESSÁRIA:" -ForegroundColor Yellow
Write-Host "   Substitua o conteúdo de src/App.js" -ForegroundColor White
Write-Host "   com o código completo do documento fornecido!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Depois, execute:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   npm install" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 O app abrirá em: http://localhost:3001" -ForegroundColor Magenta
Write-Host ""