// backend/src/seeds/createTestUsers.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const testUsers = [
  {
    name: 'João Silva',
    email: 'joao.silva@test.com',
    password: '123456',
    phone: '(21) 99999-1111',
    userType: 'provider',
    category: 'Eletricista',
    pricePerHour: 80,
    bio: 'Eletricista com 10 anos de experiência em instalações residenciais e comerciais',
    isAvailableAsProvider: true,
    skills: ['Instalações residenciais', 'Manutenção elétrica', 'Automação'],
    avatar: '👨‍🔧'
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@test.com',
    password: '123456',
    phone: '(21) 99999-2222',
    userType: 'provider',
    category: 'Diarista',
    pricePerHour: 60,
    bio: 'Diarista profissional e confiável com referências',
    isAvailableAsProvider: true,
    skills: ['Limpeza geral', 'Organização', 'Passar roupas'],
    avatar: '👩'
  },
  {
    name: 'Carlos Souza',
    email: 'carlos.souza@test.com',
    password: '123456',
    phone: '(21) 99999-3333',
    userType: 'provider',
    category: 'Encanador',
    pricePerHour: 90,
    bio: 'Especialista em instalações hidráulicas e reparos',
    isAvailableAsProvider: true,
    skills: ['Instalação hidráulica', 'Reparos', 'Desentupimento'],
    avatar: '👨'
  },
  {
    name: 'Ana Costa',
    email: 'ana.costa@test.com',
    password: '123456',
    phone: '(21) 99999-4444',
    userType: 'client',
    avatar: '👩‍💼'
  },
  {
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@test.com',
    password: '123456',
    phone: '(21) 99999-5555',
    userType: 'client',
    avatar: '👤'
  },
  {
    name: 'TechShop Ltda',
    email: 'contato@techshop.com',
    password: '123456',
    phone: '(21) 3333-4444',
    userType: 'company',
    cnpj: '12.345.678/0001-99',
    companyDescription: 'Loja de tecnologia e eletrônicos',
    avatar: '🏢'
  }
];

async function seed() {
  try {
    console.log('🔌 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    console.log('🗑️  Removendo usuários antigos...');
    await User.deleteMany({});
    console.log('✅ Usuários removidos\n');

    console.log('👥 Criando usuários de teste...');
    const users = await User.create(testUsers);
    console.log('✅ Usuários criados com sucesso!\n');

    console.log('📋 LISTA DE USUÁRIOS CRIADOS:');
    console.log('================================\n');
    
    users.forEach(user => {
      console.log(`${user.avatar} ${user.name}`);
      console.log(`   Tipo: ${user.userType}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      if (user.userType === 'provider') {
        console.log(`   Categoria: ${user.category}`);
        console.log(`   Preço/hora: R$ ${user.pricePerHour}`);
      }
      console.log('');
    });

    console.log('================================');
    console.log('✅ Seed concluído com sucesso!');
    console.log('\n💡 Use estes IDs para criar solicitações de teste:');
    console.log(`   Prestador 1 (João): ${users[0]._id}`);
    console.log(`   Prestador 2 (Maria): ${users[1]._id}`);
    console.log(`   Prestador 3 (Carlos): ${users[2]._id}`);
    console.log(`   Cliente 1 (Ana): ${users[3]._id}`);
    console.log(`   Cliente 2 (Pedro): ${users[4]._id}`);
    console.log(`   Empresa (TechShop): ${users[5]._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    process.exit(1);
  }
}

seed();