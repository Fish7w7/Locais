// frontend/src/pages/Services.jsx - COM LINKS PARA PERFIL
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Search, MapPin, Star, Clock, CheckCircle, XCircle, Edit3, PlayCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, serviceAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';
import { useAuthPrompt } from '../contexts/AuthPromptContext';
import { useDebounce } from '../hooks/useDebounce';
import { useDragScroll } from '../hooks/useDragScroll';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useConfirm } from '../hooks/useConfirm';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import UserProfileLink from '../components/UserProfileLink';
import CreateServiceModal from '../components/CreateServiceModal';
import SendJobProposalModal from '../components/SendJobProposalModal';
import CreateReviewModal from '../components/CreateReviewModal';
import ConfirmModal from '../components/ConfirmModal';
import PullToRefresh from '../components/PullToRefresh';
import { SkeletonList, SkeletonProviderCard, SkeletonServiceCard } from '../components/Skeleton';
import StartChatButton from '../components/StartChatButton';
import { 
  EmptyStateNoProviders, 
  EmptyStateNoServices,
  EmptyStateNoReceivedServices,
  EmptyStateSearchNoResults,
  EmptyStateError
} from '../components/EmptyState';
import { StatusBadge } from '../components/Badge';

const statusPriority = {
  pending: 0,
  negotiating: 1,
  accepted: 2,
  in_progress: 3,
  pending_client_confirmation: 4,
  disputed: 5,
  completed: 6,
  rejected: 7,
  cancelled: 8
};

const getTimestamp = (item) => new Date(item.updatedAt || item.createdAt || 0).getTime();

const sortServiceItems = (items, pendingFirst = false) => {
  return [...items].sort((a, b) => {
    if (pendingFirst) {
      const priorityDiff = (statusPriority[a.status] ?? 9) - (statusPriority[b.status] ?? 9);
      if (priorityDiff !== 0) return priorityDiff;
    }
    return getTimestamp(b) - getTimestamp(a);
  });
};

const getStatusCopy = (status, context) => {
  const requesterCopy = {
    pending: {
      title: 'Aguardando resposta',
      description: 'O prestador ainda não respondeu sua solicitação.'
    },
    negotiating: {
      title: 'Alteracao sugerida',
      description: 'O prestador sugeriu novos detalhes. Voce pode aceitar, cancelar ou continuar pelo chat.'
    },
    accepted: {
      title: 'Aceito pelo prestador',
      description: 'Você já pode conversar com o prestador para combinar os detalhes.'
    },
    in_progress: {
      title: 'Servico em andamento',
      description: 'Combine os proximos passos pelo chat.'
    },
    pending_client_confirmation: {
      title: 'Aguardando sua confirmacao',
      description: 'O prestador marcou o servico como realizado. Confirme a conclusao ou abra disputa.'
    },
    disputed: {
      title: 'Em disputa',
      description: 'Voce contestou a conclusao. Use o chat para registrar informacoes.'
    },
    rejected: {
      title: 'Recusado pelo prestador',
      description: 'Esse prestador não poderá atender a solicitação.'
    },
    completed: {
      title: 'Serviço concluído',
      description: 'A solicitação foi marcada como concluída.'
    },
    cancelled: {
      title: 'Solicitação cancelada',
      description: 'Você cancelou essa solicitação.'
    }
  };

  const providerCopy = {
    pending: {
      title: 'Nova solicitação',
      description: 'Responda para o cliente saber se você pode atender.'
    },
    negotiating: {
      title: 'Negociando alteracao',
      description: 'Aguarde o cliente responder sua sugestao ou continue alinhando pelo chat.'
    },
    accepted: {
      title: 'Serviço aceito',
      description: 'Converse com o solicitante e inicie quando o servico comecar.'
    },
    in_progress: {
      title: 'Servico em andamento',
      description: 'Mantenha o solicitante atualizado pelo chat.'
    },
    pending_client_confirmation: {
      title: 'Aguardando confirmacao do cliente',
      description: 'Voce marcou como realizado. O cliente precisa confirmar para concluir.'
    },
    disputed: {
      title: 'Em disputa',
      description: 'O cliente contestou a conclusao. Mantenha as informacoes organizadas no chat.'
    },
    rejected: {
      title: 'Solicitação recusada',
      description: 'Você recusou essa solicitação.'
    },
    completed: {
      title: 'Serviço concluído',
      description: 'Esse atendimento já foi finalizado.'
    },
    cancelled: {
      title: 'Solicitação cancelada',
      description: 'O solicitante cancelou esse pedido.'
    }
  };

  const copy = context === 'received' ? providerCopy : requesterCopy;
  return copy[status] || requesterCopy.pending;
};

const Services = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { requireAuth } = useAuthPrompt();
  const { success, error: showError } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const { counts: activityCounts, refreshActivityNotifications } = useActivityNotifications();
  const { confirmState, confirm, cancel } = useConfirm();
  const isVisitor = !isAuthenticated || !user;
  const isProvider = user?.type === 'provider';
  const isCompany = user?.type === 'company';
  const isAdmin = user?.type === 'admin' || user?.role === 'admin';
  const canRequestServices = true;
  const canReceiveServices = isProvider || isAdmin;

  const tabsScrollRef = useDragScroll();
  const filtersScrollRef = useDragScroll();

  const [providers, setProviders] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedServices, setReceivedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCategory, setSelectedCategory, clearCategory] = useLocalStorage('service-category', '');
  
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.tab || (user?.type === 'provider' ? 'received' : 'providers');
  });
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showSuggestChangeModal, setShowSuggestChangeModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  const serviceStatusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'negotiating', label: 'Negociando' },
    { value: 'accepted', label: 'Aceitos' },
    { value: 'in_progress', label: 'Em andamento' },
    { value: 'pending_client_confirmation', label: 'A confirmar' },
    { value: 'completed', label: 'Concluidos' },
    { value: 'disputed', label: 'Disputas' },
    { value: 'rejected', label: 'Recusados' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  const formatDate = (date) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'Data não informada';
    return parsedDate.toLocaleDateString('pt-BR');
  };
  const formatCurrency = (value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const pageDescription = (() => {
    if (isVisitor) return 'Explore prestadores e crie uma conta quando quiser solicitar um serviço.';
    if (isProvider) return 'Contrate prestadores e responda solicitações recebidas.';
    if (isCompany) return 'Encontre prestadores e acompanhe solicitações enviadas.';
    if (isAdmin) return 'Gerencie buscas, solicitações e serviços recebidos.';
    return 'Encontre e contrate prestadores de serviço.';
  })();

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (isVisitor && activeTab !== 'providers') {
      setActiveTab('providers');
      return;
    }
    if (!canRequestServices && (activeTab === 'providers' || activeTab === 'my-requests')) {
      setActiveTab('received');
    }
    if (!canReceiveServices && activeTab === 'received') {
      setActiveTab('providers');
    }
  }, [activeTab, canRequestServices, canReceiveServices, isVisitor]);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCategory]);

  useEffect(() => {
    const pendingAction = location.state?.pendingAction;
    const pendingProviderId = location.state?.providerId;

    if (!isAuthenticated || activeTab !== 'providers' || !pendingAction || !pendingProviderId || providers.length === 0) {
      return;
    }

    const provider = providers.find((item) => String(item._id) === String(pendingProviderId));
    if (!provider) return;

    setSelectedProvider(provider);

    if (pendingAction === 'request-service') {
      setShowServiceModal(true);
    }

    if (pendingAction === 'send-proposal' && (isCompany || isAdmin)) {
      setShowProposalModal(true);
    }

    navigate('/services', { replace: true, state: { tab: 'providers' } });
  }, [activeTab, isAdmin, isAuthenticated, isCompany, location.state, navigate, providers]);

  useEffect(() => {
    setStatusFilter('');
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!canRequestServices && (activeTab === 'providers' || activeTab === 'my-requests')) {
        return;
      }
      if (!canReceiveServices && activeTab === 'received') {
        return;
      }
      
      if (activeTab === 'providers' && canRequestServices) {
        const res = await userAPI.getProviders({ category: selectedCategory });
        setProviders(res.data.providers);
      } else if (activeTab === 'my-requests' && canRequestServices && !isVisitor) {
        const res = await serviceAPI.getMyRequests();
        setMyRequests(res.data.requests);
        await serviceAPI.markMyRequestsViewed();
        await refreshActivityNotifications();
      } else if (activeTab === 'received' && canReceiveServices && !isVisitor) {
        const res = await serviceAPI.getReceivedServices();
        setReceivedServices(res.data.services);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data.message || 'Erro ao carregar dados');
      showError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = (provider) => {
    if (!requireAuth({
      suggestedType: 'client',
      returnTo: '/services',
      returnState: {
        tab: 'providers',
        pendingAction: 'request-service',
        providerId: provider._id
      }
    })) {
      return;
    }

    setSelectedProvider(provider);
    setShowServiceModal(true);
  };

  const handleSendProposal = (provider) => {
    if (!requireAuth({
      suggestedType: 'company',
      returnTo: '/services',
      returnState: {
        tab: 'providers',
        pendingAction: 'send-proposal',
        providerId: provider._id
      }
    })) {
      return;
    }

    setSelectedProvider(provider);
    setShowProposalModal(true);
  };

  const handleAcceptService = async (serviceId) => {
    await confirm({
      title: 'Aceitar Serviço',
      message: 'Deseja aceitar esta solicitação de serviço',
      variant: 'info',
      onConfirm: async () => {
        try {
          showLoading('Aceitando serviço...');
          await serviceAPI.updateStatus(serviceId, { status: 'accepted' });
          success('Serviço aceito com sucesso!');
          await loadData();
          refreshActivityNotifications();
        } catch (err) {
          showError(err.response?.data.message || 'Erro ao aceitar serviço');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleRejectService = async (serviceId) => {
    await confirm({
      title: 'Rejeitar Serviço',
      message: 'Tem certeza que deseja rejeitar esta solicitação',
      variant: 'danger',
      onConfirm: async () => {
        try {
          showLoading('Rejeitando serviço...');
          await serviceAPI.updateStatus(serviceId, { status: 'rejected' });
          success('Serviço rejeitado');
          await loadData();
          refreshActivityNotifications();
        } catch (err) {
          showError(err.response?.data.message || 'Erro ao rejeitar serviço');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleCompleteService = async (serviceId) => {
    await confirm({
      title: 'Marcar como realizado',
      message: 'O cliente ainda precisara confirmar a conclusao. Deseja continuar?',
      variant: 'info',
      onConfirm: async () => {
        try {
          showLoading('Marcando servico como realizado...');
          await serviceAPI.updateStatus(serviceId, { status: 'pending_client_confirmation' });
          success('Servico enviado para confirmacao do cliente.');
          await loadData();
          refreshActivityNotifications();
        } catch (err) {
          showError(err.response?.data.message || 'Erro ao marcar servico como realizado');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleCancelService = async (serviceId) => {
    await confirm({
      title: 'Cancelar Solicitação',
      message: 'Deseja cancelar esta solicitação de serviço',
      variant: 'warning',
      onConfirm: async () => {
        try {
          showLoading('Cancelando solicitação...');
          await serviceAPI.updateStatus(serviceId, { status: 'cancelled' });
          success('Solicitação cancelada');
          await loadData();
          refreshActivityNotifications();
        } catch (err) {
          showError(err.response?.data.message || 'Erro ao cancelar solicitação');
        } finally {
          hideLoading();
        }
      }
    });
  };

  const handleStartService = async (serviceId) => {
    try {
      showLoading('Iniciando servico...');
      await serviceAPI.updateStatus(serviceId, { status: 'in_progress' });
      success('Servico iniciado.');
      await loadData();
      refreshActivityNotifications();
    } catch (err) {
      showError(err.response?.data.message || 'Erro ao iniciar servico');
    } finally {
      hideLoading();
    }
  };

  const handleAcceptNegotiation = async (serviceId) => {
    try {
      showLoading('Aceitando alteracao...');
      await serviceAPI.respondToNegotiation(serviceId, { action: 'accept' });
      success('Alteracao aceita. Servico aceito.');
      await loadData();
      refreshActivityNotifications();
    } catch (err) {
      showError(err.response?.data.message || 'Erro ao aceitar alteracao');
    } finally {
      hideLoading();
    }
  };

  const handleConfirmCompletion = async (serviceId) => {
    try {
      showLoading('Confirmando conclusao...');
      await serviceAPI.updateStatus(serviceId, { status: 'completed' });
      success('Servico concluido.');
      await loadData();
      refreshActivityNotifications();
    } catch (err) {
      showError(err.response?.data.message || 'Erro ao confirmar conclusao');
    } finally {
      hideLoading();
    }
  };

  const normalizedSearchTerm = debouncedSearchTerm.toLowerCase();
  const availableProviders = providers.filter(provider => String(provider._id) !== String(user?.id || ''));
  const filteredProviders = availableProviders.filter(provider =>
    (provider.name || '').toLowerCase().includes(normalizedSearchTerm) ||
    (provider.category || '').toLowerCase().includes(normalizedSearchTerm)
  );

  const visibleMyRequests = statusFilter
    ? sortServiceItems(myRequests).filter(request => request.status === statusFilter)
    : sortServiceItems(myRequests);

  const visibleReceivedServices = statusFilter
    ? sortServiceItems(receivedServices, true).filter(service => service.status === statusFilter)
    : sortServiceItems(receivedServices, true);

  const statusCounts = useMemo(() => {
    const source = activeTab === 'received' ? receivedServices : myRequests;
    return serviceStatusOptions.reduce((counts, option) => {
      counts[option.value] = option.value
        ? source.filter(item => item.status === option.value).length
        : source.length;
      return counts;
    }, {});
  }, [activeTab, myRequests, receivedServices]);

  const renderServiceStatusNote = (status, context) => {
    const statusCopy = getStatusCopy(status, context);
    const isPendingReceived = context === 'received' && status === 'pending';

    return (
      <div className={`mb-3 rounded-lg px-3 py-2 ${
        isPendingReceived
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'bg-gray-50 dark:bg-gray-700/70'
      }`}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {statusCopy.title}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {statusCopy.description}
        </p>
      </div>
    );
  };

  const renderTabBadge = (count) => {
    if (!count) return null;
    return (
      <span className="ml-2 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  const renderNegotiationDetails = (service) => {
    if (service.status !== 'negotiating' || !service.negotiation?.message) return null;

    return (
      <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-800 dark:bg-yellow-900/20">
        <p className="font-semibold text-yellow-900 dark:text-yellow-100">Sugestao do prestador</p>
        <p className="mt-1 text-yellow-800 dark:text-yellow-200">{service.negotiation.message}</p>
        <div className="mt-2 grid gap-1 text-xs text-yellow-800 dark:text-yellow-200 sm:grid-cols-3">
          {service.negotiation.suggestedDate && <span>Data: {formatDate(service.negotiation.suggestedDate)}</span>}
          {service.negotiation.estimatedHours && <span>Horas: {service.negotiation.estimatedHours}</span>}
          {service.negotiation.estimatedAmount !== null && service.negotiation.estimatedAmount !== undefined && (
            <span>Valor: {formatCurrency(service.negotiation.estimatedAmount)}</span>
          )}
        </div>
      </div>
    );
  };

  const canChatForService = (status) => [
    'negotiating',
    'accepted',
    'in_progress',
    'pending_client_confirmation',
    'disputed'
  ].includes(status);

  const renderContent = () => {
    if (loading) {
      return (
        <SkeletonList 
          count={5} 
          CardComponent={activeTab === 'providers' ? SkeletonProviderCard : SkeletonServiceCard} 
        />
      );
    }

    if (error) {
      return <EmptyStateError message={error} onRetry={loadData} />;
    }

    // Buscar Prestadores - COM LINK PARA PERFIL
    if (activeTab === 'providers') {
      if (filteredProviders.length === 0 && debouncedSearchTerm) {
        return (
          <EmptyStateSearchNoResults 
            searchTerm={debouncedSearchTerm}
            onClear={() => setSearchTerm('')}
          />
        );
      }

      if (availableProviders.length === 0) {
        return (
          <EmptyStateNoProviders 
            onAction={() => {
              clearCategory();
              setSearchTerm('');
              loadData();
            }}
          />
        );
      }

      return (
        <div className="space-y-3">
          {filteredProviders.map((provider) => (
            <Card key={provider._id}>
              {/* NOME CLICÁVEL - LEVA AO PERFIL */}
              <UserProfileLink
                userId={provider._id}
                userName={provider.name}
                userAvatar={provider.avatar}
                subtitle={provider.category}
              />

              {/* Localização */}
              {provider.city && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <MapPin className="w-3 h-3" />
                  {provider.city}, {provider.state}
                </div>
              )}

              {/* Rating e Preço */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">
                    {Number(provider.providerRating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({provider.providerReviewCount || 0})
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  {formatCurrency(provider.pricePerHour)}/hora
                </div>
              </div>

              {/* Descrição */}
              {provider.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                  {provider.description}
                </p>
              )}

              {/* Botão Solicitar */}
              <div className={`mt-3 grid gap-2 ${((user?.type === 'company' || user?.type === 'admin')) ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <Button
                variant={(user?.type === 'company' || user?.type === 'admin') ? 'secondary' : 'primary'}
                fullWidth
                size="sm"
                onClick={() => handleRequestService(provider)}
              >
                Solicitar Serviço
              </Button>
              {(user?.type === 'company' || user?.type === 'admin') && (
                <Button
                  variant="primary"
                  fullWidth
                  size="sm"
                  icon={Briefcase}
                  onClick={() => handleSendProposal(provider)}
                >
                  Enviar Proposta
                </Button>
              )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    // Minhas Solicitações - COM LINK PARA PERFIL DO PRESTADOR
    if (activeTab === 'my-requests') {
      if (myRequests.length === 0) {
        return (
          <EmptyStateNoServices 
            onAction={() => navigate('/services', { state: { tab: 'providers' } })}
          />
        );
      }

      return (
        <div className="space-y-3">
          {visibleMyRequests.length === 0 && (
            <Card>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">
                Nenhuma solicitação encontrada para este status.
              </p>
            </Card>
          )}

          {visibleMyRequests.map((request) => (
            <Card key={request._id}>
              {renderServiceStatusNote(request.status, 'requester')}

              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {request.title || 'Serviço solicitado'}
                  </h3>
                  
                  {/* NOME DO PRESTADOR CLICÁVEL */}
                  <UserProfileLink
                    userId={request.providerId?._id}
                    userName={request.providerId?.name || 'Prestador'}
                    userAvatar={request.providerId?.avatar}
                    subtitle={request.category || request.providerId?.category || 'Serviço'}
                    showArrow={false}
                    className="mt-1"
                  />
                </div>
                <StatusBadge status={request.status} />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {request.description || 'Sem descricao informada.'}
              </p>
              {renderNegotiationDetails(request)}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{request.location || 'Local não informado'}</span>
                </div>
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                    {formatDate(request.requestedDate)}
                </div>
                {request.price && (
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                      {formatCurrency(request.price)}
                  </span>
                )}
                </div>
              </div>
               {/* BOTÃO CONVERSAR */}
              {['pending', 'accepted'].includes(request.status) && (
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleCancelService(request._id)}
                  >
                    Cancelar Solicitação
                  </Button>
                </div>
              )}

              {request.status === 'negotiating' && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleAcceptNegotiation(request._id)}
                  >
                    Aceitar alteracao
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleCancelService(request._id)}
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              {request.status === 'pending_client_confirmation' && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleConfirmCompletion(request._id)}
                  >
                    Confirmar conclusao
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    size="sm"
                    icon={AlertTriangle}
                    onClick={() => {
                      setSelectedService(request);
                      setShowDisputeModal(true);
                    }}
                  >
                    Abrir disputa
                  </Button>
                </div>
              )}

              {request.status === 'completed' && !request.providerRating && request.providerId?._id && (
                <div className="mt-3">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    icon={Star}
                    onClick={() => {
                      setSelectedService(request);
                      setShowReviewModal(true);
                    }}
                  >
                    Avaliar prestador
                  </Button>
                </div>
              )}

              {canChatForService(request.status) && request.providerId?._id && (
                <div className="mt-3">
                  <StartChatButton
                    otherUserId={request.providerId?._id}
                    type="service"
                    relatedId={request._id}
                    fullWidth
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      );
    }

    // Serviços Recebidos - COM LINK PARA PERFIL DO SOLICITANTE
    if (activeTab === 'received') {
      if (receivedServices.length === 0) {
        return (
          <EmptyStateNoReceivedServices
            onAction={() => navigate('/profile')}
            actionLabel="Atualizar perfil"
          />
        );
      }

      return (
        <div className="space-y-3">
          {visibleReceivedServices.length === 0 && (
            <Card>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-6">
                Nenhum serviço recebido encontrado para este status.
              </p>
            </Card>
          )}

          {visibleReceivedServices.map((service) => (
            <Card key={service._id}>
              {renderServiceStatusNote(service.status, 'received')}

              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {service.title || 'Solicitação recebida'}
                  </h3>
                  
                  {/* NOME DO CLIENTE CLICÁVEL */}
                  <UserProfileLink
                    userId={service.requesterId?._id}
                    userName={service.requesterId?.name || 'Solicitante'}
                    userAvatar={service.requesterId?.avatar}
                    subtitle={service.requesterType === 'company' ? 'Empresa' : 'Cliente'}
                    showArrow={false}
                    className="mt-1"
                  />
                </div>
                <StatusBadge status={service.status} />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {service.description || 'Sem descricao informada.'}
              </p>
              {renderNegotiationDetails(service)}
              
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <MapPin className="w-4 h-4" />
                {service.location || 'Local não informado'}
              </div>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  {formatDate(service.requestedDate)}
                </div>
                {service.price && (
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {formatCurrency(service.price)}
                  </span>
                )}
              </div>
              
              {service.status === 'pending' && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleAcceptService(service._id)}
                  >
                    Aceitar
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    icon={Edit3}
                    onClick={() => {
                      setSelectedService(service);
                      setShowSuggestChangeModal(true);
                    }}
                  >
                    Sugerir
                  </Button>
                  <Button 
                    variant="danger" 
                    fullWidth 
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleRejectService(service._id)}
                  >
                    Recusar
                  </Button>
                </div>
              )}

              {service.status === 'negotiating' && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    icon={Edit3}
                    onClick={() => {
                      setSelectedService(service);
                      setShowSuggestChangeModal(true);
                    }}
                  >
                    Ajustar sugestao
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleRejectService(service._id)}
                  >
                    Recusar
                  </Button>
                </div>
              )}

              {service.status === 'accepted' && (
                <div className={`grid grid-cols-1 gap-2 mt-3 ${service.requesterId?._id ? 'sm:grid-cols-2' : ''}`}>
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="sm"
                    icon={PlayCircle}
                    onClick={() => handleStartService(service._id)}
                  >
                    Iniciar servico
                  </Button>
                  {/* BOTÃO CONVERSAR */}
                  {service.requesterId?._id && (
                    <StartChatButton
                      otherUserId={service.requesterId?._id}
                      type="service"
                      relatedId={service._id}
                      fullWidth
                    />
                  )}
                </div>
              )}

              {service.status === 'in_progress' && (
                <div className={`grid grid-cols-1 gap-2 mt-3 ${service.requesterId?._id ? 'sm:grid-cols-2' : ''}`}>
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleCompleteService(service._id)}
                  >
                    Marcar como realizado
                  </Button>
                  {service.requesterId?._id && (
                    <StartChatButton
                      otherUserId={service.requesterId?._id}
                      type="service"
                      relatedId={service._id}
                      fullWidth
                    />
                  )}
                </div>
              )}

              {['negotiating', 'pending_client_confirmation', 'disputed'].includes(service.status) && service.requesterId?._id && (
                <div className="mt-3">
                  <StartChatButton
                    otherUserId={service.requesterId?._id}
                    type="service"
                    relatedId={service._id}
                    fullWidth
                  />
                </div>
              )}

              {service.status === 'completed' && !service.clientRating && service.requesterId?._id && (
                <div className="mt-3">
                  <Button
                    variant="primary"
                    fullWidth
                    size="sm"
                    icon={Star}
                    onClick={() => {
                      setSelectedService(service);
                      setShowReviewModal(true);
                    }}
                  >
                    Avaliar cliente
                  </Button>
                </div>
              )}
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Serviços
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {pageDescription}
          </p>
        </div>

        {/* Tabs */}
        <div 
          ref={tabsScrollRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-4"
        >
          {canRequestServices && (
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'providers' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Buscar Prestadores
            </button>
          )}
          {canRequestServices && !isVisitor && (
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'my-requests' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Minhas Solicitações
              {renderTabBadge(activityCounts.clientServices)}
            </button>
          )}
          {canReceiveServices && (
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                activeTab === 'received' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Serviços Recebidos
              {renderTabBadge(activityCounts.receivedServices)}
            </button>
          )}
        </div>

        {(activeTab === 'my-requests' || activeTab === 'received') && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-4">
            {serviceStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  statusFilter === option.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
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

        {/* Search and Filters */}
        {activeTab === 'providers' && (
          <div className="space-y-3">
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />

            <div 
              ref={filtersScrollRef}
              className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pr-4"
            >
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  selectedCategory === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                    selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {renderContent()}

        {/* Modals */}
        {selectedProvider && (
          <CreateServiceModal
            isOpen={showServiceModal}
            onClose={() => {
              setShowServiceModal(false);
              setSelectedProvider(null);
            }}
            provider={selectedProvider}
            onSuccess={loadData}
          />
        )}

        {selectedProvider && (
          <SendJobProposalModal
            isOpen={showProposalModal}
            onClose={() => {
              setShowProposalModal(false);
              setSelectedProvider(null);
            }}
            provider={selectedProvider}
          />
        )}

        <SuggestChangeModal
          isOpen={showSuggestChangeModal}
          service={selectedService}
          onClose={() => {
            setShowSuggestChangeModal(false);
            setSelectedService(null);
          }}
          onSubmit={async (payload) => {
            try {
              await serviceAPI.suggestChange(selectedService._id, payload);
              success('Sugestao enviada ao cliente.');
              setShowSuggestChangeModal(false);
              setSelectedService(null);
              await loadData();
              refreshActivityNotifications();
            } catch (err) {
              showError(err.response?.data.message || 'Erro ao enviar sugestao');
            }
          }}
        />

        <DisputeModal
          isOpen={showDisputeModal}
          service={selectedService}
          onClose={() => {
            setShowDisputeModal(false);
            setSelectedService(null);
          }}
          onSubmit={async (payload) => {
            try {
              await serviceAPI.openDispute(selectedService._id, payload);
              success('Disputa aberta.');
              setShowDisputeModal(false);
              setSelectedService(null);
              await loadData();
              refreshActivityNotifications();
            } catch (err) {
              showError(err.response?.data.message || 'Erro ao abrir disputa');
            }
          }}
        />

        {selectedService && (
          <CreateReviewModal
            isOpen={showReviewModal}
            onClose={() => {
              setShowReviewModal(false);
              setSelectedService(null);
            }}
            userId={activeTab === 'received' ? selectedService.requesterId?._id : selectedService.providerId?._id}
            userType={activeTab === 'received' ? 'client' : 'provider'}
            serviceId={selectedService._id}
            onSuccess={async () => {
              setShowReviewModal(false);
              setSelectedService(null);
              await loadData();
            }}
          />
        )}

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

const SuggestChangeModal = ({ isOpen, service, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requestedDate: '',
    estimatedHours: '',
    estimatedAmount: '',
    message: ''
  });

  useEffect(() => {
    if (isOpen && service) {
      setFormData({
        requestedDate: service.requestedDate ? new Date(service.requestedDate).toISOString().slice(0, 16) : '',
        estimatedHours: service.estimatedHours || '',
        estimatedAmount: service.estimatedAmount || service.price || '',
        message: ''
      });
    }
  }, [isOpen, service]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        requestedDate: formData.requestedDate,
        estimatedHours: formData.estimatedHours,
        estimatedAmount: formData.estimatedAmount,
        message: formData.message.trim()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sugerir alteracao" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nova data e horario"
          type="datetime-local"
          value={formData.requestedDate}
          onChange={(event) => setFormData({ ...formData, requestedDate: event.target.value })}
          min={new Date().toISOString().slice(0, 16)}
          required
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Horas estimadas"
            type="number"
            value={formData.estimatedHours}
            onChange={(event) => setFormData({ ...formData, estimatedHours: event.target.value })}
            min="0.5"
            step="0.5"
            required
          />
          <Input
            label="Valor estimado"
            type="number"
            value={formData.estimatedAmount}
            onChange={(event) => setFormData({ ...formData, estimatedAmount: event.target.value })}
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mensagem para o cliente
          </label>
          <textarea
            value={formData.message}
            onChange={(event) => setFormData({ ...formData, message: event.target.value })}
            rows={4}
            required
            minLength={5}
            maxLength={1000}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Explique o motivo da alteracao sugerida."
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Enviar sugestao
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DisputeModal = ({ isOpen, service, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ reason: '', description: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        reason: formData.reason.trim(),
        description: formData.description.trim()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abrir disputa" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
          Informe o que aconteceu. A plataforma preservara os registros necessarios para analise.
        </div>
        <Input
          label="Motivo"
          value={formData.reason}
          onChange={(event) => setFormData({ ...formData, reason: event.target.value })}
          placeholder="Ex: servico incompleto"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descricao
          </label>
          <textarea
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            rows={5}
            required
            minLength={10}
            maxLength={2000}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Descreva a contestacao com detalhes."
          />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button type="submit" variant="danger" fullWidth loading={loading}>
            Abrir disputa
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Services;
