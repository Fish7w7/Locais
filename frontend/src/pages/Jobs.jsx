// frontend/src/pages/Jobs.jsx
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Users, Plus, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jobAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';
import { useAuthPrompt } from '../contexts/AuthPromptContext';
import { useDebounce } from '../hooks/useDebounce';
import { useDragScroll } from '../hooks/useDragScroll';
import { useConfirm } from '../hooks/useConfirm';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import CreateJobModal from '../components/CreateJobModal';
import ViewCandidatesModal from '../components/ViewCandidatesModal';
import EditJobModal from '../components/EditJobModal';
import JobDetailsModal from '../components/JobDetailsModal';
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

const statusPriority = {
  pending: 0,
  reviewing: 1,
  accepted: 2,
  rejected: 3,
  cancelled: 4
};

const getTimestamp = (item) => new Date(item.updatedAt || item.createdAt || 0).getTime();

const sortByStatusAndDate = (items) => {
  return [...items].sort((a, b) => {
    const priorityDiff = (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9);
    if (priorityDiff !== 0) return priorityDiff;
    return getTimestamp(b) - getTimestamp(a);
  });
};

const sortCompanyJobs = (jobs, activeView) => {
  return [...jobs].sort((a, b) => {
    if (activeView === 'candidates') {
      const pendingDiff = Number(b.applicationsCount || 0) - Number(a.applicationsCount || 0);
      if (pendingDiff !== 0) return pendingDiff;
    }
    return getTimestamp(b) - getTimestamp(a);
  });
};

const getJobCompanyId = (job) => job.companyId?._id || job.companyId;

const Jobs = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { requireAuth } = useAuthPrompt();
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
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('');
  
  const [activeTab, setActiveTab] = useState(() => {
    if (location.state?.tab) return location.state.tab;
    if (user?.type === 'company') return 'my-jobs';
    return 'available';
  });
  
  const [showCreateJobModal, setShowCreateJobModal] = useState(() => {
    return location.state?.openCreateModal || false;
  });
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const isVisitor = !isAuthenticated || !user;
  const isProvider = user?.type === 'provider';
  const isCompany = user?.type === 'company';
  const isClient = user?.type === 'client';
  const isAdmin = user?.type === 'admin' || user?.role === 'admin';
  const activeView = location.state?.view;

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

  const applicationStatusOptions = [
    { value: '', label: 'Todas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'reviewing', label: 'Em análise' },
    { value: 'accepted', label: 'Aceitas' },
    { value: 'rejected', label: 'Recusadas' },
    { value: 'cancelled', label: 'Canceladas' }
  ];

  const normalizeJobText = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    const text = String(value);

    const decoded = mojibakePattern.test(text)
      ? decodeMojibake(text)
      : text;

    return brokenTextReplacements.reduce((result, [pattern, replacement]) => {
      return result.replace(pattern, (match) => matchCase(match, replacement));
    }, decoded);
  };

  const decodeMojibake = (value) => {
    try {
      const bytes = Uint8Array.from(value, (char) => char.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return value;
    }
  };

  const matchCase = (source, replacement) => {
    return source[0] === source[0]?.toUpperCase()
      ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
      : replacement;
  };

  const brokenTextReplacements = [
    [new RegExp('manuten\\uFFFD\\uFFFDo', 'gi'), 'manutenção'],
    [new RegExp('servi\\uFFFDo', 'gi'), 'serviço'],
    [new RegExp('el\\uFFFDrica', 'gi'), 'elétrica'],
    [new RegExp('t\\uFFFDcnico', 'gi'), 'técnico'],
    [new RegExp('mec\\uFFFDnico', 'gi'), 'mecânico'],
    [new RegExp('n\\uFFFDo', 'gi'), 'não'],
    [new RegExp('t\\uFFFDtulo', 'gi'), 'título'],
    [new RegExp('descri\\uFFFD\\uFFFDo', 'gi'), 'descrição']
  ];
  const mojibakePattern = new RegExp('[\\u00C3\\u00C2]');

  const formatCurrency = (value) => `R$ ${Number(value).toLocaleString('pt-BR')}`;

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
    if (location.state?.openCreateModal) {
      if (requireAuth({
        suggestedType: 'company',
        returnTo: '/jobs',
        returnState: { openCreateModal: true }
      }) && (isCompany || isAdmin)) {
        setShowCreateJobModal(true);
      }
    }
  }, [isAdmin, isCompany, location.state, requireAuth]);

  useEffect(() => {
    const pendingAction = location.state?.pendingAction;
    const pendingJobId = location.state?.jobId;

    if (!isAuthenticated || activeTab !== 'available' || pendingAction !== 'apply-job' || !pendingJobId || jobs.length === 0) {
      return;
    }

    if (!isProvider && !isAdmin) {
      return;
    }

    const job = jobs.find((item) => String(item._id) === String(pendingJobId));
    if (!job) return;

    setSelectedJob(job);
    setShowApplyModal(true);
    navigate('/jobs', { replace: true, state: { tab: 'available' } });
  }, [activeTab, isAdmin, isAuthenticated, isProvider, jobs, location.state, navigate]);

  useEffect(() => {
    if (isVisitor && activeTab !== 'available') {
      setActiveTab('available');
    }
  }, [activeTab, isVisitor]);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedType]);

  useEffect(() => {
    setProposalStatusFilter('');
    setApplicationStatusFilter('');
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isVisitor && activeTab !== 'available') {
        setActiveTab('available');
        return;
      }
      
      if (activeTab === 'available') {
        const jobsRequest = jobAPI.getJobs({ type: selectedType });
        const applicationsRequest = (isProvider || isAdmin) && !isVisitor
          ? jobAPI.getMyApplications()
          : Promise.resolve({ data: { applications: [] } });

        const [jobsResponse, applicationsResponse] = await Promise.all([
          jobsRequest,
          applicationsRequest
        ]);

        setJobs(jobsResponse.data.jobs || []);
        setMyApplications(applicationsResponse.data.applications || []);
      } else if (activeTab === 'my-applications') {
        const res = await jobAPI.getMyApplications();
        setMyApplications(res.data.applications || []);
      } else if (activeTab === 'my-proposals' && (isProvider || isAdmin)) {
        const res = await jobAPI.getMyProposals();
        setMyProposals(res.data.proposals || []);
      } else if (activeTab === 'sent-proposals' && (isCompany || isAdmin)) {
        const res = await jobAPI.getSentProposals();
        setSentProposals(res.data.proposals || []);
      } else if (activeTab === 'my-jobs' && (isCompany || isAdmin)) {
        const res = await jobAPI.getMyJobs();
        setMyCompanyJobs(res.data.jobs || []);
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
    if (!requireAuth({
      suggestedType: 'provider',
      returnTo: '/jobs',
      returnState: {
        tab: 'available',
        pendingAction: 'apply-job',
        jobId: job._id
      }
    })) {
      return;
    }

    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
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
    if (!requireAuth({
      suggestedType: 'company',
      returnTo: '/jobs',
      returnState: { tab: 'my-jobs' }
    })) {
      return;
    }

    setSelectedJob(job);
    setShowCandidatesModal(true);
  };

  const handleCandidatesViewed = async () => {
    await loadData();
    await refreshActivityNotifications();
  };

  const handleEditJob = (job) => {
    if (!requireAuth({
      suggestedType: 'company',
      returnTo: '/jobs',
      returnState: { tab: 'my-jobs' }
    })) {
      return;
    }

    setSelectedJob(job);
    setShowEditJobModal(true);
  };

  const isOwnJob = (job) => {
    return String(getJobCompanyId(job)) === String(user?.id || '');
  };

  const filteredJobs = jobs.filter(job => {
    const query = debouncedSearchTerm.toLowerCase();
    return (
      normalizeJobText(job.title).toLowerCase().includes(query) ||
      normalizeJobText(job.category).toLowerCase().includes(query)
    );
  });

  const sortedFilteredJobs = [...filteredJobs].sort((a, b) => {
    if (isCompany) {
      const ownJobDiff = Number(isOwnJob(b)) - Number(isOwnJob(a));
      if (ownJobDiff !== 0) return ownJobDiff;
    }
    return getTimestamp(b) - getTimestamp(a);
  });

  const visibleMyProposals = proposalStatusFilter
    ? sortByStatusAndDate(myProposals).filter(proposal => proposal.status === proposalStatusFilter)
    : sortByStatusAndDate(myProposals);

  const visibleSentProposals = proposalStatusFilter
    ? sortByStatusAndDate(sentProposals).filter(proposal => proposal.status === proposalStatusFilter)
    : sortByStatusAndDate(sentProposals);

  const visibleMyApplications = applicationStatusFilter
    ? sortByStatusAndDate(myApplications).filter(application => application.status === applicationStatusFilter)
    : sortByStatusAndDate(myApplications);

  const proposalStatusCounts = useMemo(() => {
    const source = activeTab === 'sent-proposals' ? sentProposals : myProposals;
    return proposalStatusOptions.reduce((counts, option) => {
      counts[option.value] = option.value
        ? source.filter(item => item.status === option.value).length
        : source.length;
      return counts;
    }, {});
  }, [activeTab, myProposals, sentProposals]);

  const applicationStatusCounts = useMemo(() => {
    return applicationStatusOptions.reduce((counts, option) => {
      counts[option.value] = option.value
        ? myApplications.filter(item => item.status === option.value).length
        : myApplications.length;
      return counts;
    }, {});
  }, [myApplications]);

  const appliedJobIds = useMemo(() => {
    return new Set(
      myApplications
        .map(application => application.jobId?._id || application.jobId)
        .filter(Boolean)
        .map(String)
    );
  }, [myApplications]);

  const visibleCompanyJobs = useMemo(() => {
    return sortCompanyJobs(myCompanyJobs, activeView);
  }, [activeView, myCompanyJobs]);

  const renderTabBadge = (count) => {
    if (!count) return null;
    return (
      <span className="ml-2 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const getCompanyName = (job) => {
    return normalizeJobText(job.companyId?.name, 'Empresa não identificada');
  };

  const getCompanyAvatar = (job) => {
    const companyName = getCompanyName(job);
    return job.companyId?.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(companyName)}&background=random`;
  };

  const renderContent = () => {
    if (isClient) {
      return (
        <Card>
          <div className="text-center py-10 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Briefcase className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Vagas são para prestadores
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Como cliente, você pode contratar prestadores pela aba Serviços. Para buscar vagas, atualize seu perfil para prestador.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button onClick={() => navigate('/services')}>
                Buscar Prestadores
              </Button>
              <Button variant="secondary" onClick={() => navigate('/profile')}>
                Virar Prestador
              </Button>
            </div>
          </div>
        </Card>
      );
    }

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
          {sortedFilteredJobs.map((job) => (
            <Card key={job._id} hoverable>
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={getCompanyAvatar(job)}
                  alt={getCompanyName(job)}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {normalizeJobText(job.title, 'Vaga sem título')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getCompanyName(job)}
                  </p>
                </div>
                <JobTypeBadge type={job.type} />
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {normalizeJobText(job.description)}
              </p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {normalizeJobText(job.location, 'Local não informado')}
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

              {(isVisitor || isProvider || isAdmin) && (
                (isOwnJob(job) || isAdmin) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      fullWidth
                      size="sm"
                      onClick={() => handleEditJob(job)}
                    >
                      Editar vaga
                    </Button>
                    <Button
                      variant="secondary"
                      fullWidth
                      size="sm"
                      onClick={() => handleViewCandidates(job)}
                    >
                      Ver candidatos
                    </Button>
                  </div>
                ) : appliedJobIds.has(String(job._id)) ? (
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    disabled
                  >
                    Candidatura enviada
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    onClick={() => handleApply(job)}
                  >
                    Candidatar-se
                  </Button>
                )
              )}

              <Button
                variant="ghost"
                fullWidth
                size="sm"
                onClick={() => handleViewDetails(job)}
                className="mt-2"
              >
                Ver detalhes
              </Button>
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
            title={isClient ? 'Nenhuma proposta recebida' : undefined}
            description={isClient
              ? 'Você ainda não tem propostas para acompanhar. Solicite serviços para receber retornos de prestadores.'
              : undefined}
            actionLabel={isClient ? 'Buscar Prestadores' : undefined}
            onAction={() => {
              if (isClient) {
                navigate('/services');
                return;
              }

              setActiveTab('available');
            }}
          />
        );
      }

      return (
        <div className="space-y-3">
          {visibleMyApplications.length === 0 && (
            <Card>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">
                Nenhuma candidatura encontrada para este status.
              </p>
            </Card>
          )}

          {visibleMyApplications.map((application) => (
            <Card key={application._id}>
              <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/70">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {application.status === 'pending' && 'Aguardando resposta da empresa'}
                  {application.status === 'reviewing' && 'Empresa analisando sua candidatura'}
                  {application.status === 'accepted' && 'Candidatura aceita'}
                  {application.status === 'rejected' && 'Candidatura recusada'}
                  {application.status === 'cancelled' && 'Candidatura cancelada'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {application.status === 'pending' && 'Sua candidatura foi enviada e ainda não recebeu retorno.'}
                  {application.status === 'reviewing' && 'A empresa marcou sua candidatura para avaliação.'}
                  {application.status === 'accepted' && 'Você pode conversar com a empresa pelo chat.'}
                  {application.status === 'rejected' && 'A empresa decidiu não seguir com esta candidatura.'}
                  {application.status === 'cancelled' && 'Esta candidatura foi cancelada.'}
                </p>
              </div>

              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {normalizeJobText(application.jobId?.title, 'Vaga não encontrada')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {normalizeJobText(application.jobId?.companyId?.name, 'Empresa não identificada')}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <Calendar className="w-4 h-4" />
                {isClient ? 'Recebida em' : 'Candidatura em'} {new Date(application.createdAt).toLocaleDateString()}
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
                    {normalizeJobText(application.companyResponse)}
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
              <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/70">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Convite direto da empresa
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Esta proposta foi enviada para você sem candidatura prévia.
                </p>
              </div>

              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {normalizeJobText(proposal.jobId?.title, 'Vaga não encontrada')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {normalizeJobText(proposal.companyId?.name, 'Empresa não identificada')}
                  </p>
                </div>
                <StatusBadge status={proposal.status} />
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {proposal.jobId?.type && <JobTypeBadge type={proposal.jobId?.type} />}
                {proposal.jobId?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {normalizeJobText(proposal.jobId?.location)}
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
                  {normalizeJobText(proposal.message)}
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
                    {normalizeJobText(proposal.providerResponse)}
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
                      {normalizeJobText(proposal.jobId?.title, 'Vaga não encontrada')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Para {normalizeJobText(provider?.name, 'Prestador não encontrado')}
                    </p>
                  </div>
                  <StatusBadge status={proposal.status} />
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {proposal.jobId?.type && <JobTypeBadge type={proposal.jobId.type} />}
                  {proposal.jobId?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {normalizeJobText(proposal.jobId.location)}
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
                    {normalizeJobText(proposal.message)}
                  </p>
                </div>

                {proposal.providerResponse && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resposta do prestador:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {normalizeJobText(proposal.providerResponse)}
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
          {activeView === 'candidates' && (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Candidatos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Abra uma publicação para revisar as candidaturas recebidas.
                  </p>
                </div>
                <span className="inline-flex min-w-[24px] h-6 px-2 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                  {activityCounts.jobApplications || 0}
                </span>
              </div>
            </Card>
          )}

          {visibleCompanyJobs.map((job) => (
            <Card key={job._id}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {normalizeJobText(job.title, 'Vaga sem título')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {normalizeJobText(job.category)} • <JobTypeBadge type={job.type} />
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
              {isCompany ? 'Publicações' : isClient ? 'Propostas' : 'Vagas'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isVisitor && 'Explore vagas disponíveis e crie uma conta quando quiser se candidatar.'}
              {isCompany && 'Gerencie suas publicações e candidatos'}
              {isProvider && 'Encontre vagas e acompanhe suas candidaturas'}
              {isClient && 'Acompanhe propostas e retornos recebidos'}
              {isAdmin && 'Gerencie todas as vagas'}
            </p>
          </div>
          
          {(isVisitor || user?.type === 'company' || user?.type === 'admin') && (
            <Button 
              icon={Plus} 
              size="sm"
              onClick={() => {
                if (!requireAuth({
                  suggestedType: 'company',
                  returnTo: '/jobs',
                  returnState: { openCreateModal: true }
                })) {
                  return;
                }
                setShowCreateJobModal(true);
              }}
            >
              Nova Vaga
            </Button>
          )}
        </div>

        {/* Tabs com Drag Scroll */}
        <div 
          ref={tabsScrollRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-4"
        >
          {(isVisitor || isProvider || isAdmin) && (
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'available' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Vagas Disponíveis
            </button>
          )}
          
          {(isProvider || isAdmin) && (
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-applications' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isClient ? 'Propostas Recebidas' : 'Minhas Candidaturas'}
            </button>
          )}
          
          {(isProvider || isAdmin) && (
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
          
          {(isCompany || isAdmin) && (
            <button
              onClick={() => setActiveTab('sent-proposals')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'sent-proposals' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Propostas Enviadas
            </button>
          )}

          {(isCompany || isAdmin) && (
            <button
              onClick={() => setActiveTab('my-jobs')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-jobs' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Minhas Publicações
              {renderTabBadge(activityCounts.jobApplications)}
            </button>
          )}
        </div>

        {(activeTab === 'my-proposals' || activeTab === 'sent-proposals') && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-4">
            {proposalStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setProposalStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  proposalStatusFilter === option.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
                <span className={`ml-1 text-xs ${
                  proposalStatusFilter === option.value ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {proposalStatusCounts[option.value] || 0}
                </span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'my-applications' && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-4">
            {applicationStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setApplicationStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  applicationStatusFilter === option.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
                <span className={`ml-1 text-xs ${
                  applicationStatusFilter === option.value ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {applicationStatusCounts[option.value] || 0}
                </span>
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
              className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-4"
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
          onViewed={handleCandidatesViewed}
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

        <JobDetailsModal
          isOpen={showJobDetailsModal}
          onClose={() => {
            setShowJobDetailsModal(false);
            setSelectedJob(null);
          }}
          job={selectedJob}
          companyName={selectedJob ? getCompanyName(selectedJob) : ''}
          companyAvatar={selectedJob ? getCompanyAvatar(selectedJob) : ''}
          normalizeText={normalizeJobText}
          formatCurrency={formatCurrency}
          canManage={!!selectedJob && (isOwnJob(selectedJob) || isAdmin)}
          hasApplied={!!selectedJob && appliedJobIds.has(String(selectedJob._id))}
          onApply={() => {
            setShowJobDetailsModal(false);
            handleApply(selectedJob);
          }}
          onEdit={() => {
            setShowJobDetailsModal(false);
            handleEditJob(selectedJob);
          }}
          onViewCandidates={() => {
            setShowJobDetailsModal(false);
            handleViewCandidates(selectedJob);
          }}
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
