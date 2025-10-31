// Script para verificar o banco de dados
// backend/src/utils/checkDatabase.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    // Verificar usuários
    const users = await User.find({});
    console.log(`👥 Total de usuários: ${users.length}`);
    
    if (users.length > 0) {
      console.log('\n📋 Usuários cadastrados:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.userType}) - ID: ${user._id}`);
      });
    } else {
      console.log('⚠️  Nenhum usuário cadastrado!');
      console.log('💡 Execute: node src/seeds/createTestUsers.js');
    }

    // Verificar solicitações
    const requests = await ServiceRequest.find({})
      .populate('requester', 'name email userType')
      .populate('provider', 'name email category');
    
    console.log(`\n📝 Total de solicitações: ${requests.length}`);
    
    if (requests.length > 0) {
      console.log('\n📋 Solicitações cadastradas:');
      requests.forEach(req => {
        console.log(`\n   Solicitação: ${req.title}`);
        console.log(`   Status: ${req.status}`);
        console.log(`   De: ${req.requester?.name || 'NULL'} (${req.requester?._id || 'SEM ID'})`);
        console.log(`   Para: ${req.provider?.name || 'NULL'} (${req.provider?._id || 'SEM ID'})`);
        
        if (!req.requester) {
          console.log('   ⚠️  ERRO: Requester é NULL!');
        }
        if (!req.provider) {
          console.log('   ⚠️  ERRO: Provider é NULL!');
        }
      });
    } else {
      console.log('⚠️  Nenhuma solicitação cadastrada!');
      console.log('💡 Use Postman para criar uma solicitação de teste');
    }

    console.log('\n✅ Verificação completa!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkDatabase();