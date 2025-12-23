import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  maxUploadSize: {
    type: Number,
    default: 5,
    min: 1,
    max: 100,
    required: true
  },
  allowedCategories: {
    type: String,
    default: 'Eletricista, Limpeza, Encanador, TI',
    required: true
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
    required: true
  }
}, {
  timestamps: true,
  collection: 'settings' // Nome explícito da coleção
});

// Garante que só exista um documento de configurações
SettingsSchema.pre('save', async function(next) {
  const count = await mongoose.models.Settings.countDocuments();
  if (count > 0 && this.isNew) {
    const error = new Error('Só pode existir um documento de configurações');
    return next(error);
  }
  next();
});

const Settings = mongoose.model('Settings', SettingsSchema);

export default Settings;