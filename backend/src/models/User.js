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
    enum: ['client', 'provider', 'company'],
    required: true,
    default: 'client'
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
    default: null,
    unique: true,
    sparse: true
  },
  companyDescription: {
    type: String,
    default: null
  },
  
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

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

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

export default mongoose.model('User', UserSchema);