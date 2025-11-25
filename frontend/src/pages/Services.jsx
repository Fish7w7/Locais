import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI, serviceAPI } from '../api/services';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const Services = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedServices, setReceivedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('providers');

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
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      rejected: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendente',
      accepted: 'Aceito',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      cancelled: 'Cancelado',
      rejected: 'Rejeitado'
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Serviços
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {user.type === 'provider' 
            ? 'Gerencie seus serviços e solicitações'
            : 'Encontre e contrate prestadores de serviço'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'providers'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Buscar Prestadores
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'my-requests'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Minhas Solicitações
        </button>
        {(user.type === 'provider' || user.type === 'admin') && (
          <button
            onClick={() => setActiveTab('received')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              activeTab === 'received'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Serviços Recebidos
          </button>
        )}
      </div>

      {/* Buscar Prestadores */}
      {activeTab === 'providers' && (
        <>
          {/* Search and Filters */}
          <div className="space-y-3">
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Providers List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : filteredProviders.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Nenhum prestador encontrado
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredProviders.map((provider) => (
                <Card key={provider._id} hoverable>
                  <div className="flex gap-4">
                    <img
                      src={provider.avatar || `https://ui-avatars.com/api/?name=${provider.name}&background=random`}
                      alt={provider.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.category}
                      </p>
                      {provider.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          {provider.city}, {provider.state}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">
                            {provider.providerRating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({provider.providerReviewCount || 0})
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          R$ {provider.pricePerHour}/hora
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" fullWidth className="mt-3" size="sm">
                    Solicitar Serviço
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Minhas Solicitações */}
      {activeTab === 'my-requests' && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : myRequests.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Você ainda não fez nenhuma solicitação
              </p>
            </Card>
          ) : (
            myRequests.map((request) => (
              <Card key={request._id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {request.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {request.providerId.name} • {request.category}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {request.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {new Date(request.requestedDate).toLocaleDateString()}
                  </div>
                  {request.price && (
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      R$ {request.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}


      {/* Serviços Recebidos (Prestador) */}
      {activeTab === 'received' && (user.type === 'provider' || user.type === 'admin') && (
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : receivedServices.length === 0 ? (
            <Card>
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Você ainda não recebeu nenhuma solicitação
              </p>
            </Card>
          ) : (
            receivedServices.map((service) => (
              <Card key={service._id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      De: {service.requesterId.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {getStatusText(service.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {service.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {new Date(service.requestedDate).toLocaleDateString()}
                  </div>
                  {service.price && (
                    <span className="font-semibold text-primary-600 dark:text-primary-400">
                      R$ {service.price.toFixed(2)}
                    </span>
                  )}
                </div>
                {service.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="primary" fullWidth size="sm">
                      Aceitar
                    </Button>
                    <Button variant="danger" fullWidth size="sm">
                      Recusar
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Services;