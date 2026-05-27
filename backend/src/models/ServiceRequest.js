import mongoose from 'mongoose';

const ServiceRequestSchema = new mongoose.Schema({ requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterType: {
    type: String,
    enum: ['client', 'provider', 'company', 'admin'],
    required: true
  },
  
  providerId: {
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
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  location: {
    type: String,
    required: true
  },
  
  requestedDate: {
    type: Date,
    required: true
  },
  
  status: {
    type: String,
    enum: [
      'pending',
      'negotiating',
      'accepted',
      'in_progress',
      'pending_client_confirmation',
      'completed',
      'cancelled',
      'rejected',
      'disputed'
    ],
    default: 'pending'
  },
  
  price: {
    type: Number,
    default: null
  },
  
  estimatedHours: {
    type: Number,
    default: null
  },

  estimatedAmount: {
    type: Number,
    default: null
  },

  finalAmount: {
    type: Number,
    default: null
  },

  paymentStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'held', 'released', 'refunded', 'cancelled'],
    default: 'not_applicable'
  },

  paymentHoldUntil: {
    type: Date,
    default: null
  },

  paymentReleasedAt: {
    type: Date,
    default: null
  },

  negotiation: {
    suggestedDate: {
      type: Date,
      default: null
    },
    estimatedHours: {
      type: Number,
      default: null
    },
    estimatedAmount: {
      type: Number,
      default: null
    },
    message: {
      type: String,
      default: null
    },
    suggestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    suggestedAt: {
      type: Date,
      default: null
    },
    respondedAt: {
      type: Date,
      default: null
    },
    response: {
      type: String,
      enum: ['pending', 'accepted', 'cancelled', null],
      default: null
    }
  },

  disputes: [{
    reason: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    openedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    openedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open'
    }
  }],
  
  providerRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  providerReview: {
    type: String,
    default: null
  },
  
  clientRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  clientReview: {
    type: String,
    default: null
  },
  
  completedAt: {
    type: Date,
    default: null
  },

  acceptedAt: {
    type: Date,
    default: null
  },

  startedAt: {
    type: Date,
    default: null
  },

  providerMarkedDoneAt: {
    type: Date,
    default: null
  },

  cancelledAt: {
    type: Date,
    default: null
  },

  rejectedAt: {
    type: Date,
    default: null
  },

  disputedAt: {
    type: Date,
    default: null
  },
  
  notes: {
    type: String,
    default: null
  },

  requesterStatusViewedAt: {
    type: Date,
    default: null
  },

  requesterStatusUnread: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

ServiceRequestSchema.index({ providerId: 1, status: 1 });
ServiceRequestSchema.index({ requesterId: 1, status: 1 });
ServiceRequestSchema.index({ requesterId: 1, status: 1, requesterStatusUnread: 1 });

export default mongoose.model('ServiceRequest', ServiceRequestSchema);
