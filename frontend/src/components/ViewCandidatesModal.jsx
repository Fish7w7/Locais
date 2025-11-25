import { useState, useEffect } from 'react';
import { Users, Star, MapPin, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Card from './Card';
import { jobAPI } from '../api/services';

const ViewCandidatesModal = ({ isOpen, onClose, job }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [responseText, setResponseText] = useState('');

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
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
      alert('Erro ao carregar candidatos');
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
      
      alert(`Candidatura ${status === 'accepted' ? 'aceita' : 'rejeitada'} com sucesso!`);
      setSelectedApplication(null);
      setResponseText('');
      loadApplications();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao atualizar candidatura');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      reviewing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      reviewing: 'Em Análise',
      accepted: 'Aceita',
      rejected: 'Rejeitada',
      cancelled: 'Cancelada'
    };
    return texts[status] || status;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Candidatos - ${job?.title}`} size="xl">
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
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <Card key={application._id}>
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <img
                    src={application.applicantId?.avatar || `https://ui-avatars.com/api/?name=${application.applicantId?.name}&background=random`}
                    alt={application.applicantId?.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {application.applicantId?.name || 'Nome não disponível'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <Clock className="w-4 h-4" />
                          Candidatura em {new Date(application.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        {application.applicantId?.email || 'Email não disponível'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        {application.applicantId?.phone || 'Telefone não disponível'}
                      </div>
                      {application.applicantId?.city && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          {application.applicantId.city}, {application.applicantId.state}
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    {application.applicantId?.clientRating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {application.applicantId.clientRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({application.applicantId.clientReviewCount} avaliações)
                        </span>
                      </div>
                    )}

                    {/* Message */}
                    {application.message && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Mensagem do candidato:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {application.message}
                        </p>
                      </div>
                    )}

                    {/* Response Form */}
                    {selectedApplication === application._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Escreva uma mensagem para o candidato (opcional)"
                          rows={3}
                          className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-2">
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
                              {application.companyResponse}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        {application.status === 'pending' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            onClick={() => setSelectedApplication(application._id)}
                          >
                            Responder Candidatura
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
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