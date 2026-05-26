import { useState, useEffect } from 'react';
import { Users, Star, MapPin, Mail, Phone, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Card from './Card';
import StartChatButton from './StartChatButton';
import { jobAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';

const statusPriority = {
  pending: 0,
  reviewing: 1,
  accepted: 2,
  rejected: 3,
  cancelled: 4
};

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'reviewing', label: 'Em análise' },
  { value: 'accepted', label: 'Aceitos' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'cancelled', label: 'Cancelados' }
];

const brokenTextReplacements = [
  [new RegExp('manuten\\uFFFD\\uFFFDo', 'gi'), 'manutenção'],
  [new RegExp('servi\\uFFFDo', 'gi'), 'serviço'],
  [new RegExp('el\\uFFFDrica', 'gi'), 'elétrica'],
  [new RegExp('t\\uFFFDcnico', 'gi'), 'técnico'],
  [new RegExp('mec\\uFFFDnico', 'gi'), 'mecânico'],
  [new RegExp('n\\uFFFDo', 'gi'), 'não'],
  [new RegExp('descri\\uFFFD\\uFFFDo', 'gi'), 'descrição'],
  [new RegExp('indispon\\uFFFDvel', 'gi'), 'indisponível']
];

const mojibakePattern = new RegExp('[\\u00C3\\u00C2]');

const decodeMojibake = (value) => {
  try {
    const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return value;
  }
};

const normalizeText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value);
  const decoded = mojibakePattern.test(text) ? decodeMojibake(text) : text;
  return brokenTextReplacements.reduce((result, [pattern, replacement]) => {
    return result.replace(pattern, replacement);
  }, decoded);
};

const sortApplications = (items) => {
  return [...items].sort((a, b) => {
    const priorityDiff = (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
};

const ViewCandidatesModal = ({ isOpen, onClose, job, onViewed }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { success, error: showError } = useNotification();
  const { refreshActivityNotifications } = useActivityNotifications();

  useEffect(() => {
    if (isOpen && job?._id) {
      loadApplications();
    }
  }, [isOpen, job]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await jobAPI.getJobApplications(job._id);
      setApplications(res.data.applications || []);
      await refreshActivityNotifications();
      if (onViewed) await onViewed();
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
      showError('Erro ao carregar candidatos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await jobAPI.updateApplicationStatus(applicationId, {
        status,
        companyResponse: responseText || undefined
      });
      
      const statusMessages = {
        reviewing: 'Candidatura marcada em análise!',
        accepted: 'Candidatura aceita com sucesso!',
        rejected: 'Candidatura rejeitada com sucesso!'
      };
      success(statusMessages[status] || 'Candidatura atualizada com sucesso!');
      setSelectedApplication(null);
      setResponseText('');
      await loadApplications();
      refreshActivityNotifications();
    } catch (error) {
      const apiMessage = error.response?.data?.errors?.[0]?.message
        || error.response?.data?.message
        || 'Erro ao atualizar candidatura';
      showError(apiMessage);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = { pending: 'Pendente',
      reviewing: 'Em Análise',
      accepted: 'Aceita',
      rejected: 'Rejeitada',
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
  };

  const statusCounts = statusOptions.reduce((counts, option) => {
    counts[option.value] = option.value
      ? applications.filter(application => application.status === option.value).length
      : applications.length;
    return counts;
  }, {});

  const visibleApplications = statusFilter
    ? sortApplications(applications).filter(application => application.status === statusFilter)
    : sortApplications(applications);

  if (!job) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Candidatos - ${normalizeText(job.title, 'Vaga')}`} size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Header Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {applications.length} {applications.length === 1 ? 'candidato' : 'candidatos'}
              </span>
            </div>
            <Button size="sm" variant="secondary" onClick={loadApplications}>
              Atualizar
            </Button>
          </div>
        </div>

        {applications.length > 0 && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  statusFilter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
                <span className={`ml-1 text-xs ${
                  statusFilter === option.value ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {statusCounts[option.value] || 0}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum candidato ainda
            </p>
          </div>
        ) : visibleApplications.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">
              Nenhum candidato encontrado para este status.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {visibleApplications.map((application) => {
              const applicant = application.applicantId || {};
              const applicantName = normalizeText(applicant.name, 'Prestador indisponível');
              const applicantAvatar = applicant.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(applicantName)}&background=random`;
              const providerRating = Number(applicant.providerRating || 0);

              return (
              <Card key={application._id}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <img
                    src={applicantAvatar}
                    alt={applicantName}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {applicantName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Clock className="w-4 h-4" />
                          Candidatura em {new Date(application.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {applicant.category && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {normalizeText(applicant.category)}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {applicant.email || 'Email não disponível'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        {applicant.phone || 'Telefone não disponível'}
                      </div>
                      {applicant.city && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          {normalizeText(applicant.city)}, {normalizeText(applicant.state)}
                        </div>
                      )}
                      {applicant.pricePerHour && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          R$ {Number(applicant.pricePerHour).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}/hora
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {providerRating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {providerRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({applicant.providerReviewCount || 0} avaliações)
                        </span>
                      </div>
                    )}

                    {/* Message */}
                    {application.message && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Mensagem do prestador:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {normalizeText(application.message)}
                        </p>
                      </div>
                    )}

                    {/* Response Form */}
                    {selectedApplication === application._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Escreva uma mensagem para o prestador (opcional)"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Clock}
                            onClick={() => handleUpdateStatus(application._id, 'reviewing')}
                            fullWidth
                          >
                            Em análise
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CheckCircle}
                            onClick={() => handleUpdateStatus(application._id, 'accepted')}
                            fullWidth
                          >
                            Aceitar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XCircle}
                            onClick={() => handleUpdateStatus(application._id, 'rejected')}
                            fullWidth
                          >
                            Rejeitar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(null);
                              setResponseText('');
                            }}
                            fullWidth
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Company Response */}
                        {application.companyResponse && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Sua resposta:
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {normalizeText(application.companyResponse)}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {(application.status === 'pending' || application.status === 'reviewing') && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {application.status === 'pending' && (
                              <Button
                                variant="secondary"
                                size="sm"
                                fullWidth
                                icon={Clock}
                                onClick={() => handleUpdateStatus(application._id, 'reviewing')}
                              >
                                Em análise
                              </Button>
                            )}
                            <Button
                              variant={application.status === 'pending' ? 'primary' : 'secondary'}
                              size="sm"
                              fullWidth
                              onClick={() => setSelectedApplication(application._id)}
                            >
                              Responder candidatura
                            </Button>
                          </div>
                        )}

                        {/* ✅ BOTÃO CONVERSAR - Aparece quando aceito */}
                        {application.status === 'accepted' && applicant._id && (
                          <StartChatButton
                            otherUserId={applicant._id}
                            type="job_application"
                            relatedId={application._id}
                            variant="primary"
                            size="sm"
                            fullWidth
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
              );
            })}
          </div>
        )}

        {/* Close Button */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewCandidatesModal;
