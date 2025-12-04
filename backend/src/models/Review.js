// backend/src/models/Review.js
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
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
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

ReviewSchema.index({ reviewedUserId: 1, status: 1 });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ reviewerId: 1, reviewedUserId: 1, type: 1 }, { unique: true });

export default mongoose.model('Review', ReviewSchema);