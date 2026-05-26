
import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({ jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobVacancy',
    required: true
  },
  
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  message: {
    type: String,
    default: null
  },
  
  resume: {
    type: String,
    default: null
  },
  
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  companyResponse: {
    type: String,
    default: null
  },
  
  reviewedAt: {
    type: Date,
    default: null
  },

  companyViewedAt: {
    type: Date,
    default: null
  },

  companyUnread: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

ApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
ApplicationSchema.index({ jobId: 1, status: 1, companyUnread: 1 });

export default mongoose.model('Application', ApplicationSchema);
