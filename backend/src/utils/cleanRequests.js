const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ServiceRequest = require('../models/ServiceRequest');

async function clean() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    const result = await ServiceRequest.deleteMany({});
    console.log(`🗑️  ${result.deletedCount} solicitações deletadas`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

clean();