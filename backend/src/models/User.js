const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome muito longo']
  },

  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },

  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false
  },

  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },

  userType: {
    type: String,
    enum: ['client', 'provider', 'company'],
    required: true
  },

  avatar: {
    type: String,
    default: null
  },

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

  category: {
    type: String,
    enum: [
      'Eletricista', 'Encanador', 'Pintor', 'Diarista',
      'Mecânico', 'Manicure', 'Cabeleireiro', 'Confeiteiro',
      'Pedreiro', 'Professor', 'Pet Sitter', 'Técnico TI',
      'Lavador de Carros', 'Jardineiro', 'Fotógrafo',
      'Músico', 'Personal Trainer', 'Outro'
    ],
    required: function() { return this.userType === 'provider'; }
  },

  pricePerHour: {
    type: Number,
    min: 0,
    required: function() { return this.userType === 'provider'; }
  },

  portfolio: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  isAvailableAsProvider: {
    type: Boolean,
    default: true
  },

  bio: {
    type: String,
    maxlength: 500
  },

  skills: [String],

  experienceYears: {
    type: Number,
    min: 0
  },

  cnpj: {
    type: String,
    unique: true,
    sparse: true,
    required: function() { return this.userType === 'company'; }
  },

  companyDescription: {
    type: String,
    maxlength: 1000
  },

  companyAddress: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },

  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  verificationDocuments: [{
    type: String,
    url: String,
    verifiedAt: Date
  }],

  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  lastLogin: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparar senha
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual de nome exibido
userSchema.virtual('displayName').get(function() {
  return this.name;
});

module.exports = mongoose.model('User', userSchema);
