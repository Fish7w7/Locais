import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  // O ID é fixo para garantir que haja apenas um documento de configurações
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId('60c72b2f9b1e8b001c8e4d1a'), // ID fixo para upsert
    required: true,
  },
  maxUploadSize: {
    type: Number,
    default: 5, // 5 MB
    min: 1,
    max: 100,
  },
  allowedCategories: {
    type: String,
    default: 'Eletricista, Limpeza, Encanador, TI',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  // Adicione outros campos de configuração global aqui
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', SettingsSchema);

export default Settings;
