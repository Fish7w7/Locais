# 🏙️ Plataforma de Serviços Locais

Plataforma web responsiva (mobile-first) que conecta **empresas**, **prestadores de serviços** e **clientes** em cidades pequenas e médias.

## 📋 Sobre o Projeto

Esta plataforma foi desenvolvida para facilitar a conexão entre três tipos de usuários:

- **🏢 Empresas**: Publicam vagas e contratam serviços pontuais
- **👷‍♂️ Prestadores**: Oferecem serviços e recebem propostas de vagas
- **👤 Clientes**: Contratam serviços e se candidatam a vagas

### 🎯 Diferenciais

- Cliente pode evoluir para Prestador
- Prestador pode oferecer e contratar serviços
- Sistema de avaliação dupla (como cliente e como prestador)
- Interface mobile-first pronta para virar app
- Tema claro e escuro

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (autenticação)
- bcryptjs (hash de senhas)

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (ícones)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+
- MongoDB Atlas (ou local)
- npm ou yarn

### Backend

```bash
# Entrar na pasta do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Iniciar servidor
npm run dev
```

O backend estará rodando em `http://localhost:5000`

### Frontend

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
servicos-locais/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
MONGODB_URI=sua_url_mongodb_atlas
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 📱 Funcionalidades

### ✅ Implementadas

- [x] Cadastro e login com JWT
- [x] Perfil de usuário (edição)
- [x] Cliente pode se tornar Prestador
- [x] Busca de prestadores por categoria
- [x] Solicitação de serviços
- [x] Sistema de avaliações
- [x] Publicação de vagas (Empresas)
- [x] Candidaturas a vagas (Clientes)
- [x] Propostas para prestadores (Empresas)
- [x] Tema claro/escuro
- [x] Design mobile-first
- [x] Dashboard com estatísticas
### 🔜 Próximas Features

- [ ] Chat integrado
- [ ] Notificações em tempo real
- [ ] Upload de fotos (portfólio)
- [ ] Sistema de pagamentos
- [ ] Verificação de identidade
- [ ] Filtros avançados de busca
- [ ] Histórico completo de transações

## 🎨 Design

A interface foi projetada com foco em dispositivos móveis (mobile-first), com:

- Layout responsivo (360-480px otimizado)
- Navegação bottom (estilo app)
- Tema claro e escuro
- Componentes reutilizáveis
- Feedback visual claro

## 📊 Modelos de Dados

### User
- Informações básicas (nome, email, telefone)
- Tipo (client, provider, company)
- Avaliações separadas (cliente e prestador)
- Informações profissionais (prestador)

### ServiceRequest
- Solicitante e prestador
- Status do serviço
- Avaliações bilaterais

### JobVacancy
- Informações da vaga
- Tipo (temporária, experiência, efetiva)
- Contador de candidaturas

### Application
- Candidatura de cliente para vaga
- Status e resposta da empresa

### JobProposal
- Proposta de empresa para prestador
- Status e resposta do prestador

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Autores

Desenvolvido com ❤️ para conectar pessoas e oportunidades em comunidades locais.

---

**Status do Projeto**: 🚧 Em Desenvolvimento Ativo
