import mongoose from 'mongoose';

const JobProposalSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobVacancy',
    required: true
  },
  
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  offeredSalary: {
    type: Number,
    default: null
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  providerResponse: {
    type: String,
    default: null
  },
  
  respondedAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

JobProposalSchema.index({ jobId: 1, providerId: 1 }, { unique: true });

export default mongoose.model('JobProposal', JobProposalSchema);