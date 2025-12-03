import { useState, useEffect } from 'react';
import { Briefcase, DollarSign, MapPin, Calendar, Users, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { jobAPI } from '../api/services';

const EditJobModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'temporary',
    salary: '',
    salaryType: 'month',
    location: '',
    requirements: '',
    benefits: '',
    workSchedule: '',
    startDate: '',
    endDate: '',
    vacancies: '1',
    isActive: true
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
    if (job && isOpen) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        category: job.category || '',
        type: job.type || 'temporary',
        salary: job.salary || '',
        salaryType: job.salaryType || 'month',
        location: job.location || '',
        requirements: job.requirements?.join('\n') || '',
        benefits: job.benefits?.join('\n') || '',
        workSchedule: job.workSchedule || '',
        startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : '',
        endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : '',
        vacancies: job.vacancies || '1',
        isActive: job.isActive !== false
      });
    }
  }, [job, isOpen]);

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
      const requirements = formData.requirements
        .split('\n')
        .filter(r => r.trim())
        .map(r => r.trim());

      const benefits = formData.benefits
        .split('\n')
        .filter(b => b.trim())
        .map(b => b.trim());

      await jobAPI.updateJob(job._id, {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        vacancies: parseInt(formData.vacancies),
        requirements,
        benefits,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      });

      alert('Vaga atualizada com sucesso!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar vaga');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeleting(true);
      await jobAPI.deleteJob(job._id);
      alert('Vaga excluída com sucesso!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao excluir vaga');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Vaga" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Status da Vaga */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Vaga ativa (visível para candidatos)
          </label>
        </div>

        {/* Título */}
        <Input
          label="Título da Vaga"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ex: Eletricista para obra"
          icon={Briefcase}
          required
        />

        {/* Categoria e Tipo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 sm:py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="">Selecione</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Vaga
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 sm:py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="temporary">Temporária</option>
              <option value="trial">Experiência</option>
              <option value="permanent">Efetiva</option>
            </select>
          </div>
        </div>

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
            placeholder="Descreva as atividades e responsabilidades da vaga..."
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
          />
        </div>

        {/* Salário */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Salário"
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Ex: 2500"
            icon={DollarSign}
            min="0"
            step="0.01"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Salário
            </label>
            <select
              name="salaryType"
              value={formData.salaryType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 sm:py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="hour">Por hora</option>
              <option value="day">Por dia</option>
              <option value="month">Por mês</option>
              <option value="project">Por projeto</option>
            </select>
          </div>
        </div>

        {/* Local */}
        <Input
          label="Localização"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ex: Centro, São Paulo - SP"
          icon={MapPin}
          required
        />

        {/* Horário de Trabalho */}
        <Input
          label="Horário de Trabalho"
          name="workSchedule"
          value={formData.workSchedule}
          onChange={handleChange}
          placeholder="Ex: Segunda a Sexta, 8h às 17h"
        />

        {/* Datas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Início
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data de Término
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate}
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
              />
            </div>
          </div>
        </div>

        {/* Vagas */}
        <Input
          label="Número de Vagas"
          type="number"
          name="vacancies"
          value={formData.vacancies}
          onChange={handleChange}
          icon={Users}
          min="1"
          required
        />

        {/* Requisitos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Requisitos (um por linha)
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows={3}
            placeholder="Experiência mínima de 2 anos&#10;Ensino médio completo&#10;Disponibilidade para viagens"
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
          />
        </div>

        {/* Benefícios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Benefícios (um por linha)
          </label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            rows={3}
            placeholder="Vale transporte&#10;Vale alimentação&#10;Plano de saúde"
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
          />
        </div>

        {/* Botões */}
        <div className="space-y-2 pt-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
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
              disabled={loading || deleting}
              fullWidth
              className="sm:w-auto min-h-[44px]"
            >
              Cancelar
            </Button>
          </div>

          <Button
            type="button"
            variant="danger"
            fullWidth
            icon={Trash2}
            onClick={handleDelete}
            loading={deleting}
            disabled={loading}
            className="min-h-[44px]"
          >
            Excluir Vaga
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditJobModal;