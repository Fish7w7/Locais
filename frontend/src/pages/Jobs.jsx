// frontend/src/pages/Jobs.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Users, Plus, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { useDebounce } from '../hooks/useDebounce';
import { useDragScroll } from '../hooks/useDragScroll';
import { useConfirm } from '../hooks/useConfirm';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import CreateJobModal from '../components/CreateJobModal';
import ViewCandidatesModal from '../components/ViewCandidatesModal';
import EditJobModal from '../components/EditJobModal';
import ConfirmModal from '../components/ConfirmModal';
import PullToRefresh from '../components/PullToRefresh';
import { SkeletonList, SkeletonJobCard } from '../components/Skeleton';
import { 
  EmptyStateNoJobs,
  EmptyStateNoApplications,
  EmptyStateNoProposals,
  EmptyStateNoMyJobs,
  EmptyStateError
} from '../components/EmptyState';
import { StatusBadge, JobTypeBadge } from '../components/Badge';

const Jobs = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { success, error: showError } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const { confirmState, confirm, cancel } = useConfirm();

  // Hooks de Drag Scroll
  const tabsScrollRef = useDragScroll();
  const filtersScrollRef = useDragScroll();

  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myProposals, setMyProposals] = useState([]);
  const [myCompanyJobs, setMyCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || 'available';
  });
  
  const [showCreateJobModal, setShowCreateJobModal] = useState(() => {
    return location.state?.openCreateModal || false;
  });
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const jobTypes = {
    temporary: 'Temporária',
    trial: 'Experiência',
    permanent: 'Efetiva'
  };

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
    } else if (activeTab === 'my-proposals' && (user?.type === 'provider' || user?.type === 'admin')) {
      const res = await jobAPI.getMyProposals();
      setMyProposals(res.data.proposals || []);
    } else if (activeTab === 'my-jobs' && (user?.type === 'company' || user?.type === 'admin')) {
      const res = await jobAPI.getJobs();
      const allJobs = res.data.jobs || [];
      
      console.log('📊 Debug - Todas as vagas:', allJobs);
      console.log('📊 Debug - User ID:', user.id);
      
      const companyJobs = allJobs.filter(job => {
        console.log('🔍 Comparando:', {
          jobCompanyId: job.companyId?._id || job.companyId,
          userId: user.id,
          match: (job.companyId?._id || job.companyId) === user.id
        });

        const jobCompanyId = job.companyId?._id || job.companyId;
        return jobCompanyId === user.id || String(jobCompanyId) === String(user.id);
      });
      
      console.log('✅ Vagas filtradas da empresa:', companyJobs.length);
      setMyCompanyJobs(companyJobs);
    }
  } catch (err) {
    console.error('Erro ao carregar vagas:', err);
    setError(err.response?.data?.message || 'Erro ao carregar dados');
    showError('Erro ao carregar vagas');
  } finally {
    setLoading(false);
  }
};

  const handleApply = async (jobId, jobTitle) => {
    await confirm({
      title: 'Candidatar-se',
      message: `Deseja se candidatar para a vaga "${jobTitle}"?`,
      variant: 'info',
      onConfirm: async () => {
        try {
          showLoading('Enviando candidatura...');
          await jobAPI.applyToJob(jobId, {
            message: 'Gostaria de me candidatar para esta vaga.'
          });
          success('Candidatura enviada com sucesso!');
          loadData();
        } catch (err) {
          showError(err.response?.data?.message || 'Erro ao candidatar-se');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleAcceptProposal = async (proposalId) => {
    await confirm({
      title: 'Aceitar Proposta',
      message: 'Deseja aceitar esta proposta de trabalho?',
      variant: 'info',
      onConfirm: async () => {
        try {
          showLoading('Aceitando proposta...');
          await jobAPI.respondToProposal(proposalId, {
            status: 'accepted',
            providerResponse: 'Aceito a proposta!'
          });
          success('Proposta aceita!');
          loadData();
        } catch (err) {
          showError(err.response?.data?.message || 'Erro ao aceitar proposta');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleRejectProposal = async (proposalId) => {
    await confirm({
      title: 'Rejeitar Proposta',
      message: 'Tem certeza que deseja rejeitar esta proposta?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          showLoading('Rejeitando proposta...');
          await jobAPI.respondToProposal(proposalId, {
            status: 'rejected',
            providerResponse: 'Não posso aceitar no momento.'
          });
          success('Proposta rejeitada');
          loadData();
        } catch (err) {
          showError(err.response?.data?.message || 'Erro ao rejeitar proposta');
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

  const filteredJobs = jobs.filter(job =>
    job?.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    job?.category?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const getCompanyName = (job) => {
    return job?.companyId?.name || 'Empresa não identificada';
  };

  const getCompanyAvatar = (job) => {
    const companyName = getCompanyName(job);
    return job?.companyId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`;
  };

  // Renderizar conteúdo baseado no estado
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
                    {job.title}
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
                  {job.location}
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

              {(user?.type === 'client' || user?.type === 'admin') && (
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="sm"
                  onClick={() => handleApply(job._id, job.title)}
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

              {application.companyResponse && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resposta da empresa:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {application.companyResponse}
                  </p>
                </div>
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
          {myProposals.map((proposal) => (
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

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {proposal.message}
                </p>
              </div>

              {proposal.offeredSalary && (
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    R$ {proposal.offeredSalary.toLocaleString('pt-BR')}
                  </span>
                </div>
              )}

              {proposal.status === 'pending' && (
                <div className="flex gap-2 mt-3">
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
            </Card>
          ))}
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
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.category} • <JobTypeBadge type={job.type} />
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
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
              {user?.type === 'company' && 'Gerencie suas vagas e candidatos'}
              {user?.type === 'provider' && 'Veja propostas de empresas'}
              {user?.type === 'client' && 'Encontre oportunidades de trabalho'}
              {user?.type === 'admin' && 'Gerencie todas as vagas'}
            </p>
          </div>
          
          {(user?.type === 'company' || user?.type === 'admin') && (
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
              activeTab === 'available'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Vagas Disponíveis
          </button>
          
          {(user?.type === 'client' || user?.type === 'admin') && (
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-applications'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Minhas Candidaturas
            </button>
          )}
          
          {(user?.type === 'provider' || user?.type === 'admin') && (
            <button
              onClick={() => setActiveTab('my-proposals')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-proposals'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Propostas Recebidas
            </button>
          )}
          
          {(user?.type === 'company' || user?.type === 'admin') && (
            <button
              onClick={() => setActiveTab('my-jobs')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-jobs'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Minhas Vagas
            </button>
          )}
        </div>

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
                  selectedType === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Todas
              </button>
              {Object.entries(jobTypes).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedType(key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                    selectedType === key
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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