import { useEffect, useMemo, useState } from 'react';
import { Briefcase, DollarSign } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { jobAPI } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const SendJobProposalModal = ({ isOpen, onClose, provider, onSuccess }) => {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    offeredSalary: '',
    message: ''
  });

  const companyJobs = useMemo(() => {
    if (!user) return [];

    return jobs.filter((job) => {
      const companyId = job.companyId?._id || job.companyId;
      return user.type === 'admin' || String(companyId) === String(user.id);
    });
  }, [jobs, user]);

  useEffect(() => {
    if (isOpen) {
      loadJobs();
      setFormData({
        jobId: '',
        offeredSalary: '',
        message: provider
          ? `Olá, ${provider.name}. Gostaríamos de conversar sobre uma oportunidade de trabalho.`
          : ''
      });
    }
  }, [isOpen, provider]);

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await jobAPI.getJobs();
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      showError('Erro ao carregar suas vagas');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.jobId) {
      showError('Selecione uma vaga');
      return;
    }

    if (!formData.message.trim()) {
      showError('Escreva uma mensagem para o prestador');
      return;
    }

    try {
      setSending(true);
      await jobAPI.proposeToProvider(formData.jobId, {
        providerId: provider._id,
        message: formData.message.trim(),
        offeredSalary: formData.offeredSalary ? Number(formData.offeredSalary) : undefined
      });

      success('Proposta enviada com sucesso!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      showError(error.response?.data?.message || 'Erro ao enviar proposta');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Proposta" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {provider && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700 p-3">
            <img
              src={provider.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(provider.name)}&background=random`}
              alt={provider.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">{provider.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{provider.category}</p>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Vaga <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.jobId}
            onChange={(event) => setFormData((prev) => ({ ...prev, jobId: event.target.value }))}
            disabled={loadingJobs || sending}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">{loadingJobs ? 'Carregando vagas...' : 'Selecione uma vaga ativa'}</option>
            {companyJobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
          {!loadingJobs && companyJobs.length === 0 && (
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              Crie uma vaga ativa antes de enviar propostas para prestadores.
            </p>
          )}
        </div>

        <Input
          label="Valor ofertado"
          type="number"
          min="0"
          step="0.01"
          value={formData.offeredSalary}
          onChange={(event) => setFormData((prev) => ({ ...prev, offeredSalary: event.target.value }))}
          placeholder="Ex: 2500"
          icon={DollarSign}
          disabled={sending}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mensagem <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.message}
            onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
            rows={4}
            placeholder="Explique a oportunidade, prazo, local e próximos passos."
            disabled={sending}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 focus:ring-2 focus:ring-primary-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            icon={Briefcase}
            loading={sending}
            disabled={loadingJobs || companyJobs.length === 0}
          >
            Enviar Proposta
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SendJobProposalModal;
