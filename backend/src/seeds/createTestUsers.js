const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const testUsers = [
  {
    name: 'Carlos Silva',
    email: 'carlos.eletricista@test.com',
    password: '123456',
    phone: '(21) 99999-1111',
    userType: 'provider',
    category: 'Eletricista',
    pricePerHour: 80,
    bio: 'Eletricista com 10 anos de experiência',
    isAvailableAsProvider: true,
    skills: ['Instalações residenciais', 'Manutenção elétrica']
  },
  {
    name: 'Maria Santos',
    email: 'maria.diarista@test.com',
    password: '123456',
    phone: '(21) 99999-2222',
    userType: 'provider',
    category: 'Diarista',
    pricePerHour: 50,
    bio: 'Diarista profissional e confiável',
    isAvailableAsProvider: true
  },
  {
    name: 'João Cliente',
    email: 'joao.cliente@test.com',
    password: '123456',
    phone: '(21) 99999-3333',
    userType: 'client'
  },
  {
    name: 'Empresa Tech',
    email: 'contato@empresatech.com',
    password: '123456',
    phone: '(21) 99999-4444',
    userType: 'company',
    cnpj: '12345678000199',
    companyDescription: 'Empresa de tecnologia'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    // Limpar usuários existentes (CUIDADO EM PRODUÇÃO!)
    await User.deleteMany({});
    console.log('🗑️  Usuários antigos removidos');

    // Criar novos usuários
    const users = await User.create(testUsers);
    console.log('✅ Usuários criados:');
    
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.userType}): ${user._id}`);
    });

    console.log('\n📋 IDs para usar nos testes:');
    console.log(`   Prestador Carlos: ${users[0]._id}`);
    console.log(`   Prestador Maria: ${users[1]._id}`);
    console.log(`   Cliente João: ${users[2]._id}`);
    console.log(`   Empresa Tech: ${users[3]._id}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

seed();