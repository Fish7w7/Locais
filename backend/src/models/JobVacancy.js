import mongoose from 'mongoose';

const JobVacancySchema = new mongoose.Schema({
  companyId: {
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
  
  category: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['temporary', 'trial', 'permanent'],
    required: true
  },
  
  salary: {
    type: Number,
    default: null
  },
  
  salaryType: {
    type: String,
    enum: ['hour', 'day', 'month', 'project'],
    default: 'month'
  },
  
  location: {
    type: String,
    required: true
  },
  
  requirements: [{
    type: String
  }],
  
  benefits: [{
    type: String
  }],
  
  workSchedule: {
    type: String,
    default: null
  },
  
  startDate: {
    type: Date,
    default: null
  },
  
  endDate: {
    type: Date,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  vacancies: {
    type: Number,
    default: 1
  },
  
  applicationsCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

JobVacancySchema.index({ isActive: 1, category: 1 });
JobVacancySchema.index({ companyId: 1 });

export default mongoose.model('JobVacancy', JobVacancySchema);
