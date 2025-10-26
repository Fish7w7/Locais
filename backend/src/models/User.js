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
  
  // Tipo de usuário: 'client', 'provider', 'company'
  userType: {
    type: String,
    enum: ['client', 'provider', 'company'],
    required: true
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  // Avaliações COMO PRESTADOR
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
  
  // Avaliações COMO CLIENTE (quando contrata)
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
  
  // ============================================
  // CAMPOS ESPECÍFICOS PARA PRESTADOR
  // ============================================
  
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
  
  skills: [{
    type: String
  }],
  
  experienceYears: {
    type: Number,
    min: 0
  },
  
  // ============================================
  // CAMPOS ESPECÍFICOS PARA EMPRESA
  // ============================================
  
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
  
  // ============================================
  // CAMPOS COMUNS
  // ============================================
  
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
  
  lastLogin: {
    type: Date
  },
  
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

// Hash password antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual para nome completo formatado
userSchema.virtual('displayName').get(function() {
  return this.name;
});

module.exports = mongoose.model('User', userSchema);


// ============================================
// SERVICE REQUEST MODEL - Solicitação de Serviço
// backend/src/models/ServiceRequest.js
// ============================================

const serviceRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  requesterType: {
    type: String,
    enum: ['client', 'provider', 'company'],
    required: true
  },
  
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  category: {
    type: String,
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  requestedDate: {
    type: Date,
    required: true
  },
  
  estimatedDuration: {
    type: Number, // em horas
    min: 0
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  price: {
    type: Number,
    min: 0
  },
  
  negotiatedPrice: {
    type: Number,
    min: 0
  },
  
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: Date
  }],
  
  // Avaliações mútuas
  providerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewedAt: Date
  },
  
  clientRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewedAt: Date
  },
  
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para busca rápida
serviceRequestSchema.index({ provider: 1, status: 1 });
serviceRequestSchema.index({ requester: 1, status: 1 });
serviceRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);


// ============================================
// JOB VACANCY MODEL - Vaga de Empresa
// backend/src/models/JobVacancy.js
// ============================================

const jobVacancySchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    required: true
  },
  
  jobType: {
    type: String,
    enum: ['temporary', 'trial', 'permanent'],
    required: true
  },
  
  // Para temporária/experiência
  durationDays: {
    type: Number,
    min: 1,
    required: function() { 
      return this.jobType === 'temporary' || this.jobType === 'trial'; 
    }
  },
  
  requirements: [{
    type: String
  }],
  
  responsibilities: [{
    type: String
  }],
  
  benefits: [{
    type: String
  }],
  
  // Salário
  salaryMin: {
    type: Number,
    min: 0
  },
  
  salaryMax: {
    type: Number,
    min: 0
  },
  
  salaryType: {
    type: String,
    enum: ['hourly', 'daily', 'monthly', 'negotiable'],
    default: 'monthly'
  },
  
  workSchedule: {
    type: String
  },
  
  location: {
    address: String,
    city: String,
    state: String,
    isRemote: {
      type: Boolean,
      default: false
    }
  },
  
  startDate: {
    type: Date,
    required: true
  },
  
  expiresAt: {
    type: Date
  },
  
  vacancies: {
    type: Number,
    default: 1,
    min: 1
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual para contar candidaturas
jobVacancySchema.virtual('applicationCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'vacancy',
  count: true
});

// Índices
jobVacancySchema.index({ company: 1, isActive: 1 });
jobVacancySchema.index({ category: 1, isActive: 1 });
jobVacancySchema.index({ publishedAt: -1 });

module.exports = mongoose.model('JobVacancy', jobVacancySchema);


// ============================================
// APPLICATION MODEL - Candidatura de Cliente
// backend/src/models/Application.js
// ============================================

const applicationSchema = new mongoose.Schema({
  vacancy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobVacancy',
    required: true
  },
  
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  message: {
    type: String,
    maxlength: 1000
  },
  
  curriculumUrl: {
    type: String
  },
  
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: Date
  }],
  
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  
  interview: {
    scheduled: Boolean,
    date: Date,
    location: String,
    notes: String
  },
  
  appliedAt: {
    type: Date,
    default: Date.now
  },
  
  reviewedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
applicationSchema.index({ vacancy: 1, client: 1 }, { unique: true });
applicationSchema.index({ client: 1, status: 1 });
applicationSchema.index({ vacancy: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);


// ============================================
// JOB PROPOSAL MODEL - Proposta de Empresa para Prestador
// backend/src/models/JobProposal.js
// ============================================

const jobProposalSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  jobType: {
    type: String,
    enum: ['temporary', 'trial', 'permanent'],
    required: true
  },
  
  durationDays: {
    type: Number,
    min: 1
  },
  
  salaryOffer: {
    type: Number,
    min: 0
  },
  
  benefits: [{
    type: String
  }],
  
  startDate: {
    type: Date
  },
  
  workSchedule: {
    type: String
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'negotiating'],
    default: 'pending'
  },
  
  providerResponse: {
    message: String,
    respondedAt: Date
  },
  
  counterOffer: {
    salary: Number,
    message: String,
    createdAt: Date
  },
  
  sentAt: {
    type: Date,
    default: Date.now
  },
  
  expiresAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
jobProposalSchema.index({ provider: 1, status: 1 });
jobProposalSchema.index({ company: 1, status: 1 });

module.exports = mongoose.model('JobProposal', jobProposalSchema);


// ============================================
// REVIEW MODEL - Avaliações
// backend/src/models/Review.js
// ============================================

const reviewSchema = new mongoose.Schema({
  // Quem avaliou
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Quem foi avaliado
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Relacionado a qual serviço
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest'
  },
  
  // Tipo de avaliação
  reviewType: {
    type: String,
    enum: ['provider', 'client'],
    required: true
  },
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  comment: {
    type: String,
    maxlength: 500
  },
  
  aspects: {
    punctuality: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 }
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  response: {
    message: String,
    respondedAt: Date
  },
  
  helpful: {
    type: Number,
    default: 0
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
reviewSchema.index({ reviewee: 1, reviewType: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ serviceRequest: 1 });

module.exports = mongoose.model('Review', reviewSchema);


// ============================================
// NOTIFICATION MODEL - Notificações
// backend/src/models/Notification.js
// ============================================

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  type: {
    type: String,
    enum: [
      'service_request',
      'job_proposal',
      'application_status',
      'new_message',
      'review_received',
      'payment',
      'system'
    ],
    required: true
  },
  
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  
  link: {
    type: String
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);


// ============================================
// MESSAGE MODEL - Mensagens entre usuários
// backend/src/models/Message.js
// ============================================

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  content: {
    type: String,
    required: true
  },
  
  attachments: [{
    url: String,
    filename: String,
    fileType: String,
    size: Number
  }],
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);


// ============================================
// CONVERSATION MODEL - Conversas
// backend/src/models/Conversation.js
// ============================================

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  
  relatedTo: {
    type: {
      type: String,
      enum: ['service_request', 'job_vacancy', 'job_proposal']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);