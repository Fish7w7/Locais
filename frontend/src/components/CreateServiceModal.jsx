import { useState } from 'react';
import { Calendar, MapPin, Clock, FileText } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { serviceAPI } from '../api/services';

const CreateServiceModal = ({ isOpen, onClose, provider, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    requestedDate: '',
    estimatedHours: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await serviceAPI.createRequest({
        ...formData,
        providerId: provider._id,
        category: provider.category,
        estimatedHours: parseFloat(formData.estimatedHours)
      });

      alert('Solicitação enviada com sucesso!');
      onClose();
      if (onSuccess) onSuccess();
      
      // Resetar form
      setFormData({
        title: '',
        description: '',
        location: '',
        requestedDate: '',
        estimatedHours: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao solicitar serviço');
    } finally {
      setLoading(false);
    }
  };

  const estimatedPrice = formData.estimatedHours 
    ? (parseFloat(formData.estimatedHours) * provider.pricePerHour).toFixed(2)
    : '0.00';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Solicitar Serviço" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Informações do Prestador */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <img
              src={provider?.avatar || `https://ui-avatars.com/api/?name=${provider?.name}&background=random`}
              alt={provider?.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {provider?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {provider?.category} • R$ {provider?.pricePerHour}/hora
              </p>
            </div>
          </div>
        </div>

        {/* Título */}
        <Input
          label="Título do Serviço"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Instalação de ventilador"
          icon={FileText}
          required
        />

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Descreva detalhadamente o serviço que você precisa..."
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Local */}
        <Input
          label="Local do Serviço"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ex: Rua João Silva, 123 - Centro"
          icon={MapPin}
          required
        />

        {/* Data e Horas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data Desejada
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <Input
            label="Horas Estimadas"
            type="number"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            placeholder="Ex: 2"
            icon={Clock}
            required
            min="0.5"
            step="0.5"
          />
        </div>

        {/* Preço Estimado */}
        {formData.estimatedHours && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Valor estimado:
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              R$ {estimatedPrice}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.estimatedHours}h × R$ {provider?.pricePerHour}/h
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Enviar Solicitação
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateServiceModal;