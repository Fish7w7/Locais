// SERVICE REQUEST MODEL - Solicitação de Serviço

const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Solicitante é obrigatório']
  },
  
  requesterType: {
    type: String,
    enum: ['client', 'provider', 'company'],
    required: [true, 'Tipo do solicitante é obrigatório']
  },
  
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Prestador é obrigatório']
  },
  
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: [
      'Eletricista', 'Encanador', 'Pintor', 'Diarista',
      'Mecânico', 'Manicure', 'Cabeleireiro', 'Confeiteiro',
      'Pedreiro', 'Professor', 'Pet Sitter', 'Técnico TI',
      'Lavador de Carros', 'Jardineiro', 'Fotógrafo',
      'Músico', 'Personal Trainer', 'Outro'
    ]
  },
  
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [100, 'Título muito longo']
  },
  
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [1000, 'Descrição muito longa']
  },
  
  location: {
    address: {
      type: String,
      required: [true, 'Endereço é obrigatório']
    },
    city: {
      type: String,
      required: [true, 'Cidade é obrigatória']
    },
    state: {
      type: String,
      required: [true, 'Estado é obrigatório']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  requestedDate: {
    type: Date,
    required: [true, 'Data solicitada é obrigatória'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Data não pode ser no passado'
    }
  },
  
  estimatedDuration: {
    type: Number, // em horas
    min: [0.5, 'Duração mínima é 0.5 hora'],
    max: [24, 'Duração máxima é 24 horas']
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  
  price: {
    type: Number,
    min: [0, 'Preço não pode ser negativo']
  },
  
  negotiatedPrice: {
    type: Number,
    min: [0, 'Preço negociado não pode ser negativo']
  },
  
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Avaliações mútuas
  providerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
    },
    reviewedAt: Date
  },
  
  clientRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: {
      type: String,
      maxlength: 500
    },
    reviewedAt: Date
  },
  
  // Timestamps de mudança de status
  acceptedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  
  cancellationReason: {
    type: String,
    maxlength: 500
  },
  
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  rejectionReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para busca rápida
serviceRequestSchema.index({ provider: 1, status: 1 });
serviceRequestSchema.index({ requester: 1, status: 1 });
serviceRequestSchema.index({ createdAt: -1 });
serviceRequestSchema.index({ category: 1, status: 1 });

// Virtual para verificar se pode ser avaliado
serviceRequestSchema.virtual('canBeReviewed').get(function() {
  return this.status === 'completed';
});

// Virtual para verificar se já foi avaliado pelo cliente
serviceRequestSchema.virtual('isReviewedByClient').get(function() {
  return this.providerRating && this.providerRating.rating;
});

// Virtual para verificar se já foi avaliado pelo prestador
serviceRequestSchema.virtual('isReviewedByProvider').get(function() {
  return this.clientRating && this.clientRating.rating;
});

// Middleware para atualizar timestamps automaticamente
serviceRequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const now = new Date();
    
    switch(this.status) {
      case 'accepted':
        if (!this.acceptedAt) this.acceptedAt = now;
        break;
      case 'in_progress':
        if (!this.startedAt) this.startedAt = now;
        break;
      case 'completed':
        if (!this.completedAt) this.completedAt = now;
        break;
      case 'cancelled':
        if (!this.cancelledAt) this.cancelledAt = now;
        break;
    }
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);