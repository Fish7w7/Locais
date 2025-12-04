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
  
  status: {
    type: String,
    enum: ['approved', 'flagged', 'rejected', 'under_review'],
    default: 'approved' 
  },
  
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
  
  autoFlaggedReason: String,
  
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
ReviewSchema.index({ reviewerId: 1, reviewedUserId: 1, type: 1 }, { unique: true });

ReviewSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'approved') {
    const offensiveWords = [
      'idiota', 'burro', 'incompetente', 'lixo', 'merda',
    ];
    
    const textToCheck = this.comment.toLowerCase();
    const foundOffensive = offensiveWords.some(word => 
      textToCheck.includes(word)
    );
    
    if (foundOffensive) {
      this.status = 'under_review';
      this.autoFlaggedReason = 'Linguagem potencialmente ofensiva detectada';
    }
  }
  next();
});

export default mongoose.model('Review', ReviewSchema);