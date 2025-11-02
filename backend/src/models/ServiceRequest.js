import mongoose from 'mongoose';

const ServiceRequestSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterType: {
    type: String,
    enum: ['client', 'provider', 'company'],
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
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
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
  
  notes: {
    type: String,
    default: null
  }
}, { 
  timestamps: true 
});

ServiceRequestSchema.index({ providerId: 1, status: 1 });
ServiceRequestSchema.index({ requesterId: 1, status: 1 });

export default mongoose.model('ServiceRequest', ServiceRequestSchema);