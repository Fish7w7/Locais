import { useState } from 'react';
import { Briefcase, FileText, Send } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { jobAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';

const ApplyToJobModal = ({ isOpen, onClose, job, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { success, error: showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!job?._id) {
      showError('Vaga não encontrada');
      return;
    }

    if (!message.trim() || message.length < 20) {
      showError('Por favor, escreva uma mensagem com no mínimo 20 caracteres');
      return;
    }

    setLoading(true);

    try {
      await jobAPI.applyToJob(job._id, { message: message.trim() });
      success('Candidatura enviada com sucesso!');
      setMessage('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      showError(error.response?.data.message || 'Erro ao enviar candidatura');
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  const companyName = job.companyId?.name || 'Empresa não identificada';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Candidatar-se à Vaga" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Info da Vaga */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {job.title || 'Vaga não encontrada'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {companyName}
              </p>
            </div>
          </div>
        </div>

        {/* Mensagem de Apresentação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mensagem de Apresentação
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              minLength={20}
              maxLength={1000}
              placeholder="Apresente-se e explique por que você é o candidato ideal para esta vaga. Destaque suas habilidades, experiência relevante e motivação. (mínimo 20 caracteres)"
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base resize-none"
            />
          </div>
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mínimo 20 caracteres
            </p>
            <p className={`text-xs ${
              message.length > 1000 ? 'text-red-500' : message.length < 20 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {message.length}/1000
            </p>
          </div>
        </div>

        {/* Dica */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Dica:</strong> Seja específico sobre suas qualificações e demonstre entusiasmo pela oportunidade. Uma boa apresentação aumenta suas chances de ser selecionado!
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={message.length < 20 || message.length > 1000}
            icon={Send}
            className="min-h-[44px]"
          >
            Enviar Candidatura
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

export default ApplyToJobModal;
