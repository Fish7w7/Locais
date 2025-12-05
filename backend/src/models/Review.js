import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  reviewedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['client', 'provider'], 
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
    required: true,
    minlength: 10,
    maxlength: 500
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    default: null
  },
  
  // STATUS DO SISTEMA HÍBRIDO
  status: {
    type: String,
    enum: ['approved', 'flagged', 'rejected', 'under_review'],
    default: 'approved' 
  },
  
  // DENÚNCIAS
  reports: [{
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: [
        'offensive_language',
        'spam',
        'false_information',
        'harassment',
        'inappropriate',
        'other'
      ],
      required: true
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  reportsCount: {
    type: Number,
    default: 0
  },
  
  // AUTO-DETECÇÃO
  autoFlaggedReason: String,
  
  // MODERAÇÃO
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  
  // FEEDBACK DA COMUNIDADE
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Índices
ReviewSchema.index({ reviewedUserId: 1, status: 1 });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ reportsCount: 1 });
ReviewSchema.index({ reviewerId: 1, reviewedUserId: 1, serviceId: 1 }, { unique: true });

ReviewSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next();
  }

  const offensiveWords = [
    // Xingamentos comuns
    'idiota', 'burro', 'estúpido', 'imbecil', 'cretino',
    'incompetente', 'lixo', 'merda', 'bosta', 'porcaria',
    'inútil', 'vagabundo', 'preguiçoso', 'safado', 'fdp',
    'desgraçado', 'maldito', 'golpista', 'estelionatário',
    
    // Discriminação
    'negro', 'preto', 'gay', 'viado', 'bicha', 'sapatão',
    'macaco', 'retardado', 'aleijado', 'coxo',
    
    // Ameaças
    'matar', 'morrer', 'morte', 'cadeia', 'processar',
    'polícia', 'denunciar'
  ];
  
  const textToCheck = this.comment.toLowerCase();
  
  const foundOffensive = offensiveWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(textToCheck);
  });
  
  if (foundOffensive) {
    this.status = 'under_review';
    this.autoFlaggedReason = 'Linguagem potencialmente ofensiva detectada automaticamente';
    console.log(`🤖 Auto-detecção: Avaliação ${this._id} marcada para revisão`);
  }
  
  next();
});

export default mongoose.model('Review', ReviewSchema);