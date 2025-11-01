const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const ServiceRequest = require('../models/ServiceRequest');

async function testCreateRequest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado\n');

    // IMPORTANTE: Remover todos os usuários e requests antigos primeiro
    await User.deleteMany({});
    await ServiceRequest.deleteMany({});
    console.log('🗑️  Banco limpo\n');

    // Criar usuários novos
    const users = await User.create([
      {
        name: 'João Silva',
        email: 'joao.silva@test.com',
        password: '123456',
        phone: '(21) 99999-1111',
        userType: 'provider',
        category: 'Eletricista',
        pricePerHour: 80,
        bio: 'Eletricista com 10 anos de experiência',
        isAvailableAsProvider: true,
        skills: ['Instalações residenciais', 'Manutenção elétrica'],
        avatar: '👨‍🔧'
      },
      {
        name: 'Ana Costa',
        email: 'ana.costa@test.com',
        password: '123456',
        phone: '(21) 99999-4444',
        userType: 'client',
        avatar: '👩‍💼'
      }
    ]);

    const provider = users[0];
    const client = users[1];

    console.log('👥 Usuários criados:');
    console.log(`   Cliente: ${client.name} (${client._id})`);
    console.log(`   Prestador: ${provider.name} (${provider._id})\n`);

    // Criar solicitação
    const request = await ServiceRequest.create({
      requester: client._id,
      requesterType: 'client',
      provider: provider._id,
      category: provider.category,
      title: 'Instalação de tomadas',
      description: 'Preciso instalar 3 tomadas novas na sala',
      location: {
        address: 'Rua Teste, 123',
        city: 'Niterói',
        state: 'RJ'
      },
      requestedDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      estimatedDuration: 2,
      price: 150
    });

    await request.populate('requester', 'name email');
    await request.populate('provider', 'name email category');

    console.log('✅ Solicitação criada!\n');
    console.log('📝 Detalhes:');
    console.log(`   ID: ${request._id}`);
    console.log(`   Título: ${request.title}`);
    console.log(`   Status: ${request.status}\n`);

    console.log('🎯 SALVE ESTES IDs PARA USAR NO FRONTEND:\n');
    console.log(`CLIENT_ID = "${client._id}"`);
    console.log(`PROVIDER_ID = "${provider._id}"`);
    console.log(`REQUEST_ID = "${request._id}"\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

testCreateRequest();