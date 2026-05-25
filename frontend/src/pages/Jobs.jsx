// frontend/src/pages/Jobs.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Users, Plus, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';
import { useDebounce } from '../hooks/useDebounce';
import { useDragScroll } from '../hooks/useDragScroll';
import { useConfirm } from '../hooks/useConfirm';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import CreateJobModal from '../components/CreateJobModal';
import ViewCandidatesModal from '../components/ViewCandidatesModal';
import EditJobModal from '../components/EditJobModal';
import ApplyToJobModal from '../components/ApplyToJobModal';
import ConfirmModal from '../components/ConfirmModal';
import StartChatButton from '../components/StartChatButton';
import PullToRefresh from '../components/PullToRefresh';
import { SkeletonList, SkeletonJobCard } from '../components/Skeleton';
import { 
  EmptyStateNoJobs,
  EmptyStateNoApplications,
  EmptyStateNoProposals,
  EmptyStateNoSentProposals,
  EmptyStateNoMyJobs,
  EmptyStateError
} from '../components/EmptyState';
import { StatusBadge, JobTypeBadge } from '../components/Badge';

const Jobs = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const { counts: activityCounts, refreshActivityNotifications } = useActivityNotifications();
  const { confirmState, confirm, cancel } = useConfirm();

  const tabsScrollRef = useDragScroll();
  const filtersScrollRef = useDragScroll();

  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [sentProposals, setSentProposals] = useState([]);
  const [myCompanyJobs, setMyCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [proposalStatusFilter, setProposalStatusFilter] = useState('');
  
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || 'available';
  });
  
  const [showCreateJobModal, setShowCreateJobModal] = useState(() => {
    return location.state?.openCreateModal || false;
  });
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const jobTypes = { temporary: 'Temporária',
    trial: 'Experiência',
    permanent: 'Efetiva'
  };

  const proposalStatusOptions = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'accepted', label: 'Aceitas' },
    { value: 'rejected', label: 'Recusadas' },
    { value: 'cancelled', label: 'Canceladas' }
  ];

  const formatCurrency = (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`;

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.openCreateModal) {
      setShowCreateJobModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'available') {
        const res = await jobAPI.getJobs({ type: selectedType });
        setJobs(res.data.jobs || []);
      } else if (activeTab === 'my-applications') {
        const res = await jobAPI.getMyApplications();
        setMyApplications(res.data.applications || []);
      } else if (activeTab === 'my-proposals' && (user.type === 'provider' || user.type === 'admin')) {
        const res = await jobAPI.getMyProposals();
        setMyProposals(res.data.proposals || []);
      } else if (activeTab === 'sent-proposals' && (user.type === 'company' || user.type === 'admin')) {
        const res = await jobAPI.getSentProposals();
        setSentProposals(res.data.proposals || []);
      } else if (activeTab === 'my-jobs' && (user.type === 'company' || user.type === 'admin')) {
        const res = await jobAPI.getJobs();
        const allJobs = res.data.jobs || [];
        
        const companyJobs = allJobs.filter(job => {
          const jobCompanyId = job.companyId._id || job.companyId;
          return jobCompanyId === user.id || String(jobCompanyId) === String(user.id);
        });
        
        setMyCompanyJobs(companyJobs);
      }
    } catch (err) {
      console.error('Erro ao carregar vagas:', err);
      setError(err.response?.data.message || 'Erro ao carregar dados');
      showError('Erro ao carregar vagas');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleAcceptProposal = async (proposalId) => {
    await confirm({
      title: 'Aceitar Proposta',
      message: 'Deseja aceitar esta proposta de trabalho',
      variant: 'info',
      onConfirm: async () => {
        try {
          showLoading('Aceitando proposta...');
          await jobAPI.respondToProposal(proposalId, {
            status: 'accepted',
            providerResponse: 'Aceito a proposta!'
          });
          success('Proposta aceita!');
          await loadData();
          refreshActivityNotifications();
        } catch (err) {
          showError(err.response?.data.message || 'Erro ao aceitar proposta');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleRejectProposal = async (proposalId) => {
    await confirm({
      title: 'Rejeitar Proposta',
      message: 'Tem certeza que deseja rejeitar esta proposta',
      variant: 'danger',
      onConfirm: async () => {
        try {
          showLoading('Rejeitando proposta...');
          await jobAPI.respondToProposal(proposalId, {
            status: 'rejected',
            providerResponse: 'Não posso aceitar no momento.'
          });
          success('Proposta rejeitada');
          await loadData();
          refreshActivityNotifications();
        } catch (err) {
          showError(err.response?.data.message || 'Erro ao rejeitar proposta');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleViewCandidates = (job) => {
    setSelectedJob(job);
    setShowCandidatesModal(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setShowEditJobModal(true);
  };

  const filteredJobs = jobs.filter(job => {
    const query = debouncedSearchTerm.toLowerCase();
    return (
      (job.title || '').toLowerCase().includes(query) ||
      (job.category || '').toLowerCase().includes(query)
    );
  });

  const visibleMyProposals = proposalStatusFilter
    ? myProposals.filter(proposal => proposal.status === proposalStatusFilter)
    : myProposals;

  const visibleSentProposals = proposalStatusFilter
    ? sentProposals.filter(proposal => proposal.status === proposalStatusFilter)
    : sentProposals;

  const renderTabBadge = (count) => {
    if (!count) return null;
    return (
      <span className="ml-2 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const getCompanyName = (job) => {
    return job.companyId?.name || 'Empresa não identificada';
  };

  const getCompanyAvatar = (job) => {
    const companyName = getCompanyName(job);
    return job.companyId?.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(companyName)}&background=random`;
  };

  const renderContent = () => {
    if (loading) {
      return <SkeletonList count={5} CardComponent={SkeletonJobCard} />;
    }

    if (error) {
      return <EmptyStateError message={error} onRetry={loadData} />;
    }

    // Vagas Disponíveis
    if (activeTab === 'available') {
      if (filteredJobs.length === 0) {
        return <EmptyStateNoJobs />;
      }

      return (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Card key={job._id} hoverable>
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={getCompanyAvatar(job)}
                  alt={getCompanyName(job)}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {job.title || 'Vaga sem título'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCompanyName(job)}
                  </p>
                </div>
                <JobTypeBadge type={job.type} />
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location || 'Local não informado'}
                </div>
                {job.salary && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    R$ {job.salary.toLocaleString('pt-BR')}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.applicationsCount || 0} candidatos
                </div>
              </div>

              {(user.type === 'client' || user.type === 'admin') && (
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="sm"
                  onClick={() => handleApply(job)}
                >
                  Candidatar-se
                </Button>
              )}
            </Card>
          ))}
        </div>
      );
    }

    // Minhas Candidaturas
    if (activeTab === 'my-applications') {
      if (myApplications.length === 0) {
        return (
          <EmptyStateNoApplications 
            onAction={() => setActiveTab('available')}
          />
        );
      }

      return (
        <div className="space-y-3">
          {myApplications.map((application) => (
            <Card key={application._id}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {application.jobId?.title || 'Vaga não encontrada'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {application.jobId?.companyId?.name || 'Empresa não identificada'}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar className="w-4 h-4" />
                Candidatura em {new Date(application.createdAt).toLocaleDateString()}
              </div>

              {/* MENSAGEM DO CANDIDATO */}
              {application.message && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sua mensagem:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {application.message}
                  </p>
                </div>
              )}

              {/* RESPOSTA DA EMPRESA */}
              {application.companyResponse && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mb-3">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Resposta da empresa:
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {application.companyResponse}
                  </p>
                </div>
              )}

              {/* Botão conversar - Quando aceito */}
              {application.status === 'accepted' && (
                <StartChatButton
                  otherUserId={application.jobId?.companyId?._id || application.jobId?.companyId}
                  type="job_application"
                  relatedId={application._id}
                  variant="primary"
                  size="sm"
                  fullWidth
                />
              )}
            </Card>
          ))}
        </div>
      );
    }

    // Propostas Recebidas
    if (activeTab === 'my-proposals') {
      if (myProposals.length === 0) {
        return <EmptyStateNoProposals />;
      }

      return (
        <div className="space-y-3">
          {visibleMyProposals.length === 0 && (
            <Card>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">
                Nenhuma proposta encontrada para este status.
              </p>
            </Card>
          )}

          {visibleMyProposals.map((proposal) => (
            <Card key={proposal._id}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {proposal.jobId?.title || 'Vaga não encontrada'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {proposal.companyId?.name || 'Empresa não identificada'}
                  </p>
                </div>
                <StatusBadge status={proposal.status} />
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {proposal.jobId?.type && <JobTypeBadge type={proposal.jobId?.type} />}
                {proposal.jobId?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {proposal.jobId?.location}
                  </div>
                )}
                {proposal.jobId?.salary && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Vaga: {formatCurrency(proposal.jobId?.salary)}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {proposal.message}
                </p>
              </div>

              {proposal.offeredSalary && (
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    Oferta: {formatCurrency(proposal.offeredSalary)}
                  </span>
                </div>
              )}

              {proposal.status === 'pending' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleAcceptProposal(proposal._id)}
                  >
                    Aceitar
                  </Button>
                  <Button 
                    variant="danger" 
                    fullWidth 
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleRejectProposal(proposal._id)}
                  >
                    Recusar
                  </Button>
                </div>
              )}

              {proposal.providerResponse && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sua resposta:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {proposal.providerResponse}
                  </p>
                </div>
              )}

              {/* Botão conversar - Quando aceito */}
              {proposal.status === 'accepted' && (
                <div className="mt-3">
                  <StartChatButton
                    otherUserId={proposal.companyId._id}
                    type="job_proposal"
                    relatedId={proposal._id}
                    variant="primary"
                    size="sm"
                    fullWidth
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      );
    }

    // Propostas Enviadas
    if (activeTab === 'sent-proposals') {
      if (sentProposals.length === 0) {
        return <EmptyStateNoSentProposals onAction={() => navigate('/services')} />;
      }

      return (
        <div className="space-y-3">
          {visibleSentProposals.length === 0 && (
            <Card>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">
                Nenhuma proposta enviada encontrada para este status.
              </p>
            </Card>
          )}

          {visibleSentProposals.map((proposal) => {
            const provider = proposal.providerId;
            const canStartChat =
              proposal.status === 'accepted' &&
              provider?._id &&
              String(proposal.companyId?._id || proposal.companyId) === String(user.id);

            return (
              <Card key={proposal._id}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {proposal.jobId?.title || 'Vaga não encontrada'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Para {provider?.name || 'Prestador não encontrado'}
                    </p>
                  </div>
                  <StatusBadge status={proposal.status} />
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {proposal.jobId?.type && <JobTypeBadge type={proposal.jobId.type} />}
                  {proposal.jobId?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {proposal.jobId.location}
                    </div>
                  )}
                  {proposal.offeredSalary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Oferta: {formatCurrency(proposal.offeredSalary)}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {proposal.message}
                  </p>
                </div>

                {proposal.providerResponse && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resposta do prestador:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {proposal.providerResponse}
                    </p>
                  </div>
                )}

                {canStartChat && (
                  <StartChatButton
                    otherUserId={provider._id}
                    type="job_proposal"
                    relatedId={proposal._id}
                    variant="primary"
                    size="sm"
                    fullWidth
                  />
                )}
              </Card>
            );
          })}
        </div>
      );
    }

    // Minhas Vagas
    if (activeTab === 'my-jobs') {
      if (myCompanyJobs.length === 0) {
        return (
          <EmptyStateNoMyJobs 
            onAction={() => setShowCreateJobModal(true)}
          />
        );
      }

      return (
        <div className="space-y-3">
          {myCompanyJobs.map((job) => (
            <Card key={job._id}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {job.title || 'Vaga sem título'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.category} • <JobTypeBadge type={job.type} />
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {job.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {job.applicationsCount || 0} candidaturas
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Criada em {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  size="sm"
                  onClick={() => handleViewCandidates(job)}
                >
                  Ver Candidatos ({job.applicationsCount || 0})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditJob(job)}
                >
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      );
    }
  };

  return (
    <PullToRefresh onRefresh={loadData}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vagas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user.type === 'company' && 'Gerencie suas vagas e candidatos'}
              {user.type === 'provider' && 'Veja propostas de empresas'}
              {user.type === 'client' && 'Encontre oportunidades de trabalho'}
              {user.type === 'admin' && 'Gerencie todas as vagas'}
            </p>
          </div>
          
          {(user.type === 'company' || user.type === 'admin') && (
            <Button 
              icon={Plus} 
              size="sm"
              onClick={() => setShowCreateJobModal(true)}
            >
              Nova Vaga
            </Button>
          )}
        </div>

        {/* Tabs com Drag Scroll */}
        <div 
          ref={tabsScrollRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
        >
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
              activeTab === 'available' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Vagas Disponíveis
          </button>
          
          {(user.type === 'client' || user.type === 'admin') && (
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-applications' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Minhas Candidaturas
            </button>
          )}
          
          {(user.type === 'provider' || user.type === 'admin') && (
            <button
              onClick={() => setActiveTab('my-proposals')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-proposals' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Propostas Recebidas
              {renderTabBadge(activityCounts.jobProposals)}
            </button>
          )}
          
          {(user.type === 'company' || user.type === 'admin') && (
            <button
              onClick={() => setActiveTab('sent-proposals')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'sent-proposals' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Propostas Enviadas
            </button>
          )}

          {(user.type === 'company' || user.type === 'admin') && (
            <button
              onClick={() => setActiveTab('my-jobs')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-jobs' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Minhas Vagas
              {renderTabBadge(activityCounts.jobApplications)}
            </button>
          )}
        </div>

        {(activeTab === 'my-proposals' || activeTab === 'sent-proposals') && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {proposalStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setProposalStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  proposalStatusFilter === option.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Search and Filters - Apenas em Vagas Disponíveis */}
        {activeTab === 'available' && (
          <div className="space-y-3">
            <Input
              placeholder="Buscar vagas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Briefcase}
            />

            {/* Filtros de Tipo com Drag Scroll */}
            <div 
              ref={filtersScrollRef}
              className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
            >
              <button
                onClick={() => setSelectedType('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  selectedType === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Todas
              </button>
              {Object.entries(jobTypes).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                    selectedType === key ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {renderContent()}

        {/* Modals */}
        <CreateJobModal
          isOpen={showCreateJobModal}
          onClose={() => setShowCreateJobModal(false)}
          onSuccess={loadData}
        />

        <ApplyToJobModal
          isOpen={showApplyModal}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={loadData}
        />

        <ViewCandidatesModal
          isOpen={showCandidatesModal}
          onClose={() => {
            setShowCandidatesModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
        />

        <EditJobModal
          isOpen={showEditJobModal}
          onClose={() => {
            setShowEditJobModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          onSuccess={loadData}
        />

        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={cancel}
          onConfirm={confirmState.onConfirm}
          title={confirmState.title}
          message={confirmState.message}
          variant={confirmState.variant}
        />
      </div>
    </PullToRefresh>
  );
};

export default Jobs;
