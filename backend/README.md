# ⚙️ Backend - App Serviços Locais

API RESTful em Node.js + Express + MongoDB.

## 📡 Endpoints Principais

### Autenticação
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Usuários
- GET /api/users/:id
- PUT /api/users/:id
- DELETE /api/users/:id

### Prestadores
- GET /api/providers
- GET /api/providers/:id
- POST /api/providers/request

### Vagas
- GET /api/jobs
- POST /api/jobs (empresa)
- POST /api/jobs/:id/apply (cliente)
- POST /api/jobs/:id/invite (empresa → prestador)

### Solicitações
- GET /api/requests
- POST /api/requests
- PUT /api/requests/:id/status

## 🗃️ Modelos

- User (Cliente, Prestador, Empresa)
- ServiceRequest
- JobVacancy
- Application
- JobProposal
- Review

## 🚀 Como Rodar

```bash
npm install
npm run dev
```

Servidor: http://localhost:5000
