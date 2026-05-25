import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome e obrigatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email e obrigatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefone e obrigatorio'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Senha e obrigatoria'],
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
    type: String
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
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpire: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deactivatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

UserSchema.index({ cnpj: 1 }, { unique: true, sparse: true });

UserSchema.index(
  { resetPasswordExpire: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      resetPasswordExpire: { $exists: true }
    }
  }
);

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.upgradeToProvider = function(providerData) {
  if (this.type === 'company') {
    throw new Error('Empresas nao podem ser prestadores');
  }

  this.type = 'provider';
  this.isAvailableAsProvider = true;
  this.category = providerData.category;
  this.pricePerHour = providerData.pricePerHour;
  this.description = providerData.description;

  return this.save();
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
