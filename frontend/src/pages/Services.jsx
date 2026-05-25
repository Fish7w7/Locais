// frontend/src/pages/Services.jsx - COM LINKS PARA PERFIL
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, Search, MapPin, Star, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, serviceAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';
import { useDebounce } from '../hooks/useDebounce';
import { useDragScroll } from '../hooks/useDragScroll';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useConfirm } from '../hooks/useConfirm';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import UserProfileLink from '../components/UserProfileLink';
import CreateServiceModal from '../components/CreateServiceModal';
import SendJobProposalModal from '../components/SendJobProposalModal';
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

const Services = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const { counts: activityCounts, refreshActivityNotifications } = useActivityNotifications();
  const { confirmState, confirm, cancel } = useConfirm();

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
    return location.state?.tab || 'providers';
  });
  
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

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
    { value: 'accepted', label: 'Aceitos' },
    { value: 'completed', label: 'Concluídos' },
    { value: 'rejected', label: 'Recusados' },
    { value: 'cancelled', label: 'Cancelados' }
  ];

  const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');
  const formatCurrency = (value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'providers') {
        const res = await userAPI.getProviders({ category: selectedCategory });
        setProviders(res.data.providers);
      } else if (activeTab === 'my-requests') {
        const res = await serviceAPI.getMyRequests();
        setMyRequests(res.data.requests);
      } else if (activeTab === 'received' && (user.type === 'provider' || user.type === 'admin')) {
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
    setSelectedProvider(provider);
    setShowServiceModal(true);
  };

  const handleSendProposal = (provider) => {
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
      title: 'Concluir Serviço',
      message: 'Marcar este serviço como concluído',
      variant: 'info',
      onConfirm: async () => {
        try {
          showLoading('Concluindo serviço...');
          await serviceAPI.updateStatus(serviceId, { status: 'completed' });
          success('Serviço marcado como concluído!');
          await loadData();
          refreshActivityNotifications();
        } catch (err) {
          showError(err.response?.data.message || 'Erro ao concluir serviço');
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

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    provider.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const visibleMyRequests = statusFilter
    ? myRequests.filter(request => request.status === statusFilter)
    : myRequests;

  const visibleReceivedServices = statusFilter
    ? receivedServices.filter(service => service.status === statusFilter)
    : receivedServices;

  const renderTabBadge = (count) => {
    if (!count) return null;
    return (
      <span className="ml-2 inline-flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

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

      if (providers.length === 0) {
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
                    {provider.providerRating.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({provider.providerReviewCount || 0})
                  </span>
                </div>
                <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  R$ {provider.pricePerHour}/hora
                </div>
              </div>

              {/* Descrição */}
              {provider.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                  {provider.description}
                </p>
              )}

              {/* Botão Solicitar */}
              <div className={`mt-3 grid gap-2 ${(user.type === 'company' || user.type === 'admin') ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
              <Button 
                variant={(user.type === 'company' || user.type === 'admin') ? 'secondary' : 'primary'} 
                fullWidth 
                size="sm"
                onClick={() => handleRequestService(provider)}
              >
                Solicitar Serviço
              </Button>
              {(user.type === 'company' || user.type === 'admin') && (
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
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {request.title}
                  </h3>
                  
                  {/* NOME DO PRESTADOR CLICÁVEL */}
                  <UserProfileLink
                    userId={request.providerId._id}
                    userName={request.providerId.name}
                    userAvatar={request.providerId.avatar}
                    subtitle={request.category}
                    showArrow={false}
                    className="mt-1"
                  />
                </div>
                <StatusBadge status={request.status} />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {request.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{request.location}</span>
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
              {request.status === 'pending' && (
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

              {(request.status === 'accepted' || request.status === 'in_progress') && (
                <div className="mt-3">
                  <StartChatButton
                    otherUserId={request.providerId._id}
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
        return <EmptyStateNoReceivedServices />;
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
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {service.title}
                  </h3>
                  
                  {/* NOME DO CLIENTE CLICÁVEL */}
                  <UserProfileLink
                    userId={service.requesterId._id}
                    userName={service.requesterId.name}
                    userAvatar={service.requesterId.avatar}
                    subtitle="Cliente"
                    showArrow={false}
                    className="mt-1"
                  />
                </div>
                <StatusBadge status={service.status} />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {service.description}
              </p>
              
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <MapPin className="w-4 h-4" />
                {service.location}
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
                <div className="flex gap-2">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <Button 
                    variant="primary" 
                    fullWidth 
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => handleCompleteService(service._id)}
                  >
                    Marcar como Concluído
                  </Button>
                  {/* BOTÃO CONVERSAR */}
                  <StartChatButton
                    otherUserId={service.requesterId._id}
                    type="service"
                    relatedId={service._id}
                    fullWidth
                  />
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
            {user.type === 'provider' ? 'Gerencie seus serviços e solicitações' : 'Encontre e contrate prestadores de serviço'}
          </p>
        </div>

        {/* Tabs */}
        <div 
          ref={tabsScrollRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
        >
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
              activeTab === 'providers' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Buscar Prestadores
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
              activeTab === 'my-requests' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Minhas Solicitações
          </button>
          {(user.type === 'provider' || user.type === 'admin') && (
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
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {serviceStatusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  statusFilter === option.value ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {option.label}
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
              className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
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

export default Services;
