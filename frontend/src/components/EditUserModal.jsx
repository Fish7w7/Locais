import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, Shield } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import axios from 'axios';

const EditUserModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    type: 'client',
    category: '',
    pricePerHour: '',
    description: '',
    isAvailableAsProvider: false
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
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        type: user.type || 'client',
        category: user.category || '',
        pricePerHour: user.pricePerHour || '',
        description: user.description || '',
        isAvailableAsProvider: user.isAvailableAsProvider || false
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
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Usuário atualizado com sucesso!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar usuário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuário" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* Info Básica */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Shield className="w-4 h-4" />
            <span>ID: {user?._id}</span>
          </div>
        </div>

        {/* Nome */}
        <Input
          label="Nome Completo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          icon={User}
          required
        />

        {/* Email */}
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          required
        />

        {/* Telefone */}
        <Input
          label="Telefone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          icon={Phone}
          required
        />

        {/* Localização */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Cidade"
            name="city"
            value={formData.city}
            onChange={handleChange}
            icon={MapPin}
          />
          <Input
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Ex: RJ"
          />
        </div>

        {/* Tipo de Usuário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo de Usuário
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
          >
            <option value="client">Cliente</option>
            <option value="provider">Prestador</option>
            <option value="company">Empresa</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Campos de Prestador */}
        {formData.type === 'provider' && (
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Informações de Prestador
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Input
              label="Preço por Hora (R$)"
              type="number"
              name="pricePerHour"
              value={formData.pricePerHour}
              onChange={handleChange}
              icon={DollarSign}
              min="0"
              step="0.01"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição dos Serviços
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Descreva sua experiência..."
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="checkbox"
                name="isAvailableAsProvider"
                checked={formData.isAvailableAsProvider}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Disponível para receber serviços
              </label>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-2 pt-4 sticky bottom-0 bg-white dark:bg-gray-800">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Salvar Alterações
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

export default EditUserModal;