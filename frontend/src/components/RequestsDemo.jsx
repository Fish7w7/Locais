import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Calendar, MapPin, Clock, CheckCircle, XCircle, PlayCircle, Star, FileText, Search, Phone, Mail } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const api = {
  getMyRequests: async (status = '') => {
    const query = status ? `?status=${status}` : '';
    const response = await fetch(`${API_URL}/requests${query}`);
    return response.json();
  },
  getRequestById: async (id) => {
    const response = await fetch(`${API_URL}/requests/${id}`);
    return response.json();
  },
  createRequest: async (data) => {
    const response = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  acceptRequest: async (id) => {
    const response = await fetch(`${API_URL}/requests/${id}/accept`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
    return response.json();
  },
  rejectRequest: async (id, reason) => {
    const response = await fetch(`${API_URL}/requests/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return response.json();
  },
  startWork: async (id) => {
    const response = await fetch(`${API_URL}/requests/${id}/start`, { method: 'PUT' });
    return response.json();
  },
  completeWork: async (id) => {
    const response = await fetch(`${API_URL}/requests/${id}/complete`, { method: 'PUT' });
    return response.json();
  },
  cancelRequest: async (id, reason) => {
    const response = await fetch(`${API_URL}/requests/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return response.json();
  }
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Pendente' },
    accepted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Aceito' },
    in_progress: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Em Andamento' },
    completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Concluído' },
    cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', label: 'Cancelado' },
    rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Rejeitado' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const RequestsListScreen = ({ userType, onBack, onSelectRequest, onCreateNew }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const statusFilter = filter === 'all' ? '' : filter;
      const result = await api.getMyRequests(statusFilter);
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = requests.filter(req => 
    searchTerm === '' || 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filters = [
    { id: 'all', label: 'Todos' },
    { id: 'pending', label: 'Pendentes' },
    { id: 'accepted', label: 'Aceitos' },
    { id: 'in_progress', label: 'Em Andamento' },
    { id: 'completed', label: 'Concluídos' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="text-blue-600 dark:text-blue-400 flex items-center">
            <ArrowLeft size={24} />
            <span className="ml-2">Voltar</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Solicitações</h1>
          <button onClick={onCreateNew} className="bg-blue-500 text-white p-2 rounded-lg">
            <Plus size={20} />
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar solicitações..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div className="px-4 pb-4 flex space-x-2 overflow-x-auto">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${filter === f.id ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {loading ? <LoadingSpinner /> : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{userType === 'provider' ? 'Você ainda não recebeu solicitações' : 'Você ainda não fez solicitações'}</p>
            <button onClick={onCreateNew} className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold">Criar Nova Solicitação</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map(request => (
              <div key={request._id} onClick={() => onSelectRequest(request._id)} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border dark:border-gray-700 cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-1">{request.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.category}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} className="mr-2" />
                    {new Date(request.requestedDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={16} className="mr-2" />
                    {request.location.city}, {request.location.state}
                  </div>
                </div>
                {request.price && (
                  <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Valor</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">R$ {request.price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RequestDetailsScreen = ({ requestId, userType, onBack }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRequest = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getRequestById(requestId);
      if (result.success) {
        setRequest(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar solicitação:', error);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const handleAccept = async () => {
    try {
      const result = await api.acceptRequest(requestId);
      if (result.success) {
        loadRequest();
      }
    } catch (error) {
      console.error('Erro ao aceitar:', error);
    }
  };

  const handleStart = async () => {
    try {
      const result = await api.startWork(requestId);
      if (result.success) {
        loadRequest();
      }
    } catch (error) {
      console.error('Erro ao iniciar:', error);
    }
  };

  const handleComplete = async () => {
    try {
      const result = await api.completeWork(requestId);
      if (result.success) {
        loadRequest();
      }
    } catch (error) {
      console.error('Erro ao concluir:', error);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Motivo do cancelamento:');
    if (reason) {
      try {
        const result = await api.cancelRequest(requestId, reason);
        if (result.success) {
          loadRequest();
        }
      } catch (error) {
        console.error('Erro ao cancelar:', error);
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt('Motivo da rejeição:');
    if (reason) {
      try {
        const result = await api.rejectRequest(requestId, reason);
        if (result.success) {
          loadRequest();
        }
      } catch (error) {
        console.error('Erro ao rejeitar:', error);
      }
    }
  };

  if (loading || !request) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  const isProvider = userType === 'provider';
  const canAccept = isProvider && request.status === 'pending';
  const canStart = isProvider && request.status === 'accepted';
  const canComplete = isProvider && request.status === 'in_progress';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="text-blue-600 dark:text-blue-400 flex items-center">
            <ArrowLeft size={24} />
            <span className="ml-2">Voltar</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Detalhes</h1>
          <div className="w-20"></div>
        </div>
      </div>
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-2xl mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{request.title}</h2>
              <p className="opacity-90">{request.category}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
          {request.price && <div className="text-3xl font-bold">R$ {request.price.toFixed(2)}</div>}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 border dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">Descrição</h3>
          <p className="text-gray-600 dark:text-gray-400">{request.description}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 border dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-3">Informações</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <Calendar size={20} className="mr-3 text-blue-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Data Solicitada</div>
                <div className="font-semibold">{new Date(request.requestedDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <MapPin size={20} className="mr-3 text-red-500" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Localização</div>
                <div className="font-semibold">{request.location.address}, {request.location.city} - {request.location.state}</div>
              </div>
            </div>
            {request.estimatedDuration && (
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Clock size={20} className="mr-3 text-green-500" />
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Duração Estimada</div>
                  <div className="font-semibold">{request.estimatedDuration}h</div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4 border dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-3">{isProvider ? 'Cliente' : 'Prestador'}</h3>
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-4xl">{isProvider ? request.requester.avatar : request.provider.avatar}</div>
            <div className="flex-1">
              <div className="font-bold text-gray-800 dark:text-white">{isProvider ? request.requester.name : request.provider.name}</div>
              {!isProvider && (
                <div className="flex items-center space-x-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{request.provider.providerRating}</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Mail size={16} className="mr-2" />
              {isProvider ? request.requester.email : request.provider.email}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Phone size={16} className="mr-2" />
              {isProvider ? request.requester.phone : request.provider.phone}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {canAccept && (
            <>
              <button onClick={handleAccept} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-green-600">
                <CheckCircle size={20} className="mr-2" />
                Aceitar Solicitação
              </button>
              <button onClick={handleReject} className="w-full bg-red-500 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-red-600">
                <XCircle size={20} className="mr-2" />
                Rejeitar
              </button>
            </>
          )}
          {canStart && (
            <button onClick={handleStart} className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-blue-600">
              <PlayCircle size={20} className="mr-2" />
              Iniciar Trabalho
            </button>
          )}
          {canComplete && (
            <button onClick={handleComplete} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-green-600">
              <CheckCircle size={20} className="mr-2" />
              Concluir Trabalho
            </button>
          )}
          {request.status !== 'completed' && request.status !== 'cancelled' && (
            <button onClick={handleCancel} className="w-full bg-gray-500 text-white py-4 rounded-xl font-bold hover:bg-gray-600">
              Cancelar Solicitação
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CreateRequestScreen = ({ providers, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    providerId: '', category: '', title: '', description: '', address: '', city: '', state: '', requestedDate: '', estimatedDuration: '', price: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Eletricista', 'Encanador', 'Pintor', 'Diarista', 'Mecânico', 'Manicure', 'Cabeleireiro', 'Confeiteiro', 'Pedreiro', 'Professor', 'Pet Sitter', 'Técnico TI', 'Lavador de Carros', 'Jardineiro', 'Fotógrafo', 'Músico', 'Personal Trainer', 'Outro'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const requestData = {
        providerId: formData.providerId,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location: { address: formData.address, city: formData.city, state: formData.state },
        requestedDate: formData.requestedDate,
        estimatedDuration: formData.estimatedDuration ? parseFloat(formData.estimatedDuration) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined
      };
      
      console.log('Enviando solicitação:', requestData);
      const result = await api.createRequest(requestData);
      console.log('Resultado:', result);
      
      if (result.success) {
        alert('Solicitação criada com sucesso!');
        onSuccess();
      } else {
        alert('Erro ao criar solicitação: ' + (result.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar solicitação. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button onClick={onBack} className="text-blue-600 dark:text-blue-400 flex items-center">
            <ArrowLeft size={24} />
            <span className="ml-2">Voltar</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Nova Solicitação</h1>
          <div className="w-20"></div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Prestador *</label>
          <select required value={formData.providerId} onChange={(e) => setFormData({...formData, providerId: e.target.value})} className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
            <option value="">Selecione um prestador</option>
            {providers.map(p => (<option key={p.id} value={p.id}>{p.name} - {p.category} (R$ {p.price}/h)</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoria *</label>
          <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Título *</label>
          <input type="text" required minLength={5} maxLength={100} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ex: Instalação de ventilador de teto" className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descrição *</label>
          <textarea required minLength={10} maxLength={1000} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Descreva detalhadamente o serviço necessário..." rows={4} className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Endereço *</label>
          <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Rua, número, complemento" className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cidade *</label>
            <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Ex: Rio de Janeiro" className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado *</label>
            <input type="text" required maxLength={2} value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})} placeholder="UF" className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Data *</label>
            <input type="date" required min={new Date().toISOString().split('T')[0]} value={formData.requestedDate} onChange={(e) => setFormData({...formData, requestedDate: e.target.value})} className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duração (horas)</label>
            <input type="number" step="0.5" min="0.5" max="24" value={formData.estimatedDuration} onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})} placeholder="Ex: 2" className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Preço Oferecido (R$)</label>
          <input type="number" step="0.01" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="Ex: 150.00" className="w-full px-4 py-3 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors">
          {loading ? 'Criando...' : 'Criar Solicitação'}
        </button>
      </form>
    </div>
  );
};

export default function RequestsDemo({ userType, setCurrentScreen }) {
  const [screen, setScreen] = useState('list');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Buscar prestadores reais do banco
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true);
        const response = await fetch('http://localhost:5000/api/users/providers');
        const data = await response.json();
        
        if (data.success && data.data) {
          const formattedProviders = data.data.map(p => ({
            id: p._id,
            name: p.name,
            category: p.category,
            price: p.pricePerHour
          }));
          setProviders(formattedProviders);
        } else {
          // Fallback: usar lista vazia se não conseguir buscar
          console.warn('Nenhum prestador encontrado no banco');
          setProviders([]);
        }
      } catch (error) {
        console.error('Erro ao buscar prestadores:', error);
        setProviders([]);
      } finally {
        setLoadingProviders(false);
      }
    };
    
    fetchProviders();
  }, []);

  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
    setScreen('details');
  };

  const handleCreateSuccess = () => {
    setScreen('list');
  };

  const handleBack = () => {
    if (screen === 'list') {
      if (userType === 'client') setCurrentScreen('clientHome');
      else if (userType === 'provider') setCurrentScreen('providerHome');
      else if (userType === 'company') setCurrentScreen('companyHome');
    } else {
      setScreen('list');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900" style={{ minHeight: '100vh' }}>
      {screen === 'list' && (
        <RequestsListScreen
          userType={userType}
          onBack={handleBack}
          onSelectRequest={handleSelectRequest}
          onCreateNew={() => setScreen('create')}
        />
      )}
      {screen === 'details' && (
        <RequestDetailsScreen
          requestId={selectedRequestId}
          userType={userType}
          onBack={() => setScreen('list')}
        />
      )}
      {screen === 'create' && (
        <CreateRequestScreen
          providers={mockProviders}
          onBack={() => setScreen('list')}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}