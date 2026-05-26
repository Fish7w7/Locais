import { useState } from 'react';
import { Calendar, MapPin, Clock, FileText } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { serviceAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';

const initialFormData = {
  title: '',
  description: '',
  location: '',
  requestedDate: '',
  estimatedHours: ''
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const CreateServiceModal = ({ isOpen, onClose, provider, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useNotification();
  const [formData, setFormData] = useState(initialFormData);

  const providerName = provider?.name || 'Prestador';
  const providerCategory = provider?.category || 'Serviço';
  const providerPricePerHour = Number(provider?.pricePerHour || 0);
  const estimatedHours = Number(formData.estimatedHours || 0);
  const estimatedPrice = estimatedHours * providerPricePerHour;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetAndClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      requestedDate: formData.requestedDate,
      estimatedHours
    };

    if (!payload.title || !payload.description || !payload.location || !payload.requestedDate) {
      showError('Preencha título, descrição, local e data antes de enviar.');
      return;
    }

    if (!Number.isFinite(estimatedHours) || estimatedHours < 0.5) {
      showError('Informe pelo menos 0,5 hora estimada.');
      return;
    }

    setLoading(true);

    try {
      await serviceAPI.createRequest({
        ...payload,
        providerId: provider._id,
        category: providerCategory
      });

      success('Solicitação enviada com sucesso!');
      resetAndClose();
      if (onSuccess) await onSuccess();
    } catch (error) {
      const apiMessage = error.response?.data?.errors?.[0]?.message
        || error.response?.data?.message
        || 'Erro ao solicitar serviço';
      showError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Solicitar Serviço" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <img
              src={provider?.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(providerName)}&background=random`}
              alt={providerName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 object-cover"
            />
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {providerName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {providerCategory} • R$ {formatCurrency(providerPricePerHour)}/hora
              </p>
            </div>
          </div>
        </div>

        <Input
          label="Título do serviço"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Instalação de ventilador"
          icon={FileText}
          required
        />

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
            placeholder="Explique o que precisa ser feito, com detalhes importantes para o prestador."
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
          />
        </div>

        <Input
          label="Local do serviço"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ex: Rua João Silva, 123 - Centro"
          icon={MapPin}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data desejada
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                name="requestedDate"
                value={formData.requestedDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
              />
            </div>
          </div>

          <Input
            label="Horas estimadas"
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

        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Estimativa do pedido
          </p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            R$ {formatCurrency(estimatedPrice)}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {estimatedHours || 0}h × R$ {formatCurrency(providerPricePerHour)}/h. O valor final pode ser combinado no chat.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="min-h-[44px]"
          >
            Enviar solicitação
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={resetAndClose}
            disabled={loading}
            fullWidth
            className="sm:w-auto min-h-[44px]"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateServiceModal;
