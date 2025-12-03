// frontend/src/components/EditProviderInfoModal.jsx
import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, FileText } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { userAPI } from '../api/services';

const EditProviderInfoModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    pricePerHour: '',
    description: '',
    isAvailableAsProvider: true
  });

  const categories = [
    'Eletricista',
    'Encanador',
    'Pintor',
    'Pedreiro',
    'Carpinteiro',
    'Jardineiro',
    'Faxineiro',
    'Técnico em TI',
    'Mecânico',
    'Outro'
  ];

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        category: user.category || '',
        pricePerHour: user.pricePerHour || '',
        description: user.description || '',
        isAvailableAsProvider: user.isAvailableAsProvider !== false
      });
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await userAPI.updateProviderInfo({
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour)
      });

      alert('Informações atualizadas com sucesso!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar informações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Informações Profissionais" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoria de Serviço
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base min-h-[44px]"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Preço por Hora */}
        <Input
          label="Preço por Hora (R$)"
          type="number"
          name="pricePerHour"
          value={formData.pricePerHour}
          onChange={handleChange}
          placeholder="Ex: 50.00"
          icon={DollarSign}
          required
          min="0"
          step="0.01"
        />

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição dos Serviços
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              placeholder="Descreva sua experiência, especialidades e diferenciais..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.description.length}/500 caracteres
          </p>
        </div>

        {/* Disponibilidade */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="font-medium text-gray-900 dark:text-white block mb-1">
                Status de Disponibilidade
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData.isAvailableAsProvider 
                  ? 'Você aparecerá nas buscas e poderá receber solicitações'
                  : 'Você não aparecerá nas buscas'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                isAvailableAsProvider: !formData.isAvailableAsProvider
              })}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                formData.isAvailableAsProvider
                  ? 'bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                  formData.isAvailableAsProvider ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Preview do Preço */}
        {formData.pricePerHour && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Seu valor por hora:
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              R$ {parseFloat(formData.pricePerHour).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Exemplo: 4 horas = R$ {(parseFloat(formData.pricePerHour) * 4).toFixed(2)}
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="min-h-[44px]"
          >
            Salvar Alterações
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
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

export default EditProviderInfoModal;