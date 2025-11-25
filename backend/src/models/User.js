import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  type: {
    type: String,
    enum: ['client', 'provider', 'company', 'admin'],
    required: true,
    default: 'client'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Avaliações como prestador
  providerRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  providerReviewCount: {
    type: Number,
    default: 0
  },
  
  // Avaliações como cliente
  clientRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  clientReviewCount: {
    type: Number,
    default: 0
  },
  
  // Campos específicos para PRESTADOR
  category: {
    type: String,
    default: null
  },
  pricePerHour: {
    type: Number,
    default: null
  },
  portfolio: [{
    type: String
  }],
  isAvailableAsProvider: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: null
  },
  
  cnpj: {
    type: String,
  },
  companyDescription: {
    type: String,
    default: null
  },
  
  // Localização
  city: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Índice SPARSE para CNPJ
// Com sparse: true, apenas documentos onde cnpj EXISTE serão indexados
// Se cnpj for undefined (não enviado), o documento é ignorado pelo índice
UserSchema.index({ cnpj: 1 }, { unique: true, sparse: true });

// Estou deixando isso aqui para vc caso aconteca algum bug na hora de criar uma novo usuario
// Usar Partial Filter Expression (mais robusto)
// Descomente se o sparse não funcionar:
// UserSchema.index(
//   { cnpj: 1 }, 
//   { 
//     unique: true, 
//     partialFilterExpression: { cnpj: { $type: 'string' } } 
//   }
// );

// Hash password antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar senha
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para converter cliente em prestador
UserSchema.methods.upgradeToProvider = function(providerData) {
  if (this.type === 'company') {
    throw new Error('Empresas não podem ser prestadores');
  }
  
  this.type = 'provider';
  this.isAvailableAsProvider = true;
  this.category = providerData.category;
  this.pricePerHour = providerData.pricePerHour;
  this.description = providerData.description;
  
  return this.save();
};

// Evitar recompilação do modelo
export default mongoose.models.User || mongoose.model('User', UserSchema);