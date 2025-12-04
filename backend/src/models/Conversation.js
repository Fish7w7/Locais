// backend/src/models/Conversation.js
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  type: {
    type: String,
    enum: ['service', 'job_application', 'job_proposal'],
    required: true
  },
  
  relatedService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    default: null
  },
  
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobVacancy',
    default: null
  },
  
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null
  },
  
  relatedProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobProposal',
    default: null
  },
  
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: Date
  },
  
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ 'lastMessage.timestamp': -1 });
ConversationSchema.index({ relatedService: 1 });
ConversationSchema.index({ relatedJob: 1 });

export default mongoose.model('Conversation', ConversationSchema);