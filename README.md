# 🏗️ App de Serviços Locais

Sistema completo para conectar Clientes, Prestadores e Empresas.

## 📁 Estrutura do Projeto

```
servicos-locais/
├── frontend/          # React Web Mobile
├── backend/           # Node.js + Express API
└── docs/             # Documentação
```

## 🚀 Como Rodar

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis no .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## 📚 Documentação

- [API Docs](./docs/api/)
- [Database Schema](./docs/database/)
- [Design System](./docs/design/)
- [User Flows](./docs/flows/)

## 👥 Tipos de Usuário

1. **Cliente** - Contrata serviços e se candidata a vagas
2. **Prestador** - Oferece serviços e recebe propostas de empresas
3. **Empresa** - Publica vagas e contrata serviços

## 🛠️ Tecnologias

### Frontend
- React 18
- Tailwind CSS
- React Router
- Axios
- Lucide Icons

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (uploads)

## 📝 TODO

- [ ] Implementar autenticação completa
- [ ] CRUD de usuários
- [ ] Sistema de solicitações de serviço
- [ ] Sistema de vagas
- [ ] Sistema de avaliações
- [ ] Chat/mensagens
- [ ] Notificações push
- [ ] Sistema de pagamentos

