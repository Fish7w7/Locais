import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  ChevronLeft
} from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// IDs TEMPORÁRIOS - ATUALIZE APÓS EXECUTAR testRequest.js
const TEMP_USER_IDS = {
  client: '69054f6a29da97e6e3904761',    // Ana
  provider: '69054f6a29da97e6e3904760',  // João
  company: '69054f6a29da97e6e3904766'    // TechShop
};

const RequestsScreen = (props) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Pegar o user ID baseado no tipo
  const getCurrentUserId = () => {
    return TEMP_USER_IDS[props.userType] || TEMP_USER_IDS.client;
  };

  // Configurar headers do axios
  useEffect(() => {
    const userId = getCurrentUserId();
    axios.defaults.headers.common['x-user-id'] = userId;
    axios.defaults.headers.common['x-user-type'] = props.userType || 'client';
    
    console.log('🔑 Autenticação configurada:', {
      userId,
      userType: props.userType
    });
  }, [props.userType]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = getCurrentUserId();
      const params = filter !== 'all' ? { status: filter } : {};
      
      console.log('📡 Buscando requests...', { userId, userType: props.userType, params });
      
      const response = await axios.get(`${API_URL}/requests`, { 
        params,
        headers: {
          'x-user-id': userId,
          'x-user-type': props.userType || 'client'
        }
      });
      
      console.log('✅ Resposta:', response.data);
      setRequests(response.data.data || []);
    } catch (err) {
      console.error('❌ Erro ao buscar requests:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  }, [filter, props.userType]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (requestId, negotiatedPrice = null) => {
    try {
      const body = negotiatedPrice ? { negotiatedPrice } : {};
      await axios.put(`${API_URL}/requests/${requestId}/accept`, body);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (requestId, reason = '') => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/reject`, { reason });
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStart = async (requestId) => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/start`);
      fetchRequests();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/complete`);
      fetchRequests();
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (requestId) => {
    const reason = prompt('Motivo do cancelamento (mínimo 10 caracteres):');
    if (!reason || reason.length < 10) {
      alert('Motivo muito curto. Mínimo 10 caracteres.');
      return;
    }
    try {
      await axios.put(`${API_URL}/requests/${requestId}/cancel`, { reason });
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert('Erro: ' + (err.response?.data?.message || err.message));
    }
  };

  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      icon: Clock,
      label: 'Pendente'
    },
    accepted: { 
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      icon: CheckCircle,
      label: 'Aceito'
    },
    in_progress: { 
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      icon: AlertCircle,
      label: 'Em Andamento'
    },
    completed: { 
      color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      icon: CheckCircle,
      label: 'Concluído'
    },
    cancelled: { 
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      icon: XCircle,
      label: 'Cancelado'
    },
    rejected: { 
      color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      icon: XCircle,
      label: 'Rejeitado'
    }
  };

  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'pending', label: 'Pendentes' },
    { id: 'accepted', label: 'Aceitas' },
    { id: 'in_progress', label: 'Em Andamento' },
    { id: 'completed', label: 'Concluídas' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (selectedRequest) {
    return <RequestDetails 
      request={selectedRequest} 
      onBack={() => setSelectedRequest(null)}
      onAccept={handleAccept}
      onReject={handleReject}
      onStart={handleStart}
      onComplete={handleComplete}
      onCancel={handleCancel}
      userType={props.userType}
      {...props}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <Header 
        title="Solicitações" 
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
        setCurrentScreen={props.setCurrentScreen}
        darkMode={props.darkMode}
        setDarkMode={props.setDarkMode}
      />

      <div className="p-4">
        {/* Filtros */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
            <p className="font-bold">❌ Erro</p>
            <p>{error}</p>
            <button 
              onClick={fetchRequests}
              className="mt-2 text-sm underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Nenhuma solicitação
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? 'Você ainda não tem solicitações' 
                : `Nenhuma solicitação ${filters.find(f => f.id === filter)?.label.toLowerCase()}`
              }
            </p>
            {props.userType === 'client' && (
              <button
                onClick={() => props.setCurrentScreen('createRequest')}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                ➕ Criar Solicitação
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(request => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              const isProvider = props.userType === 'provider';
              const otherUser = isProvider ? request.requester : request.provider;

              if (!otherUser) return null;

              return (
                <div 
                  key={request._id}
                  onClick={() => setSelectedRequest(request)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-3xl">{otherUser?.avatar || '👤'}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white">{request.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {isProvider ? 'De: ' : 'Para: '}{otherUser?.name || 'Usuário'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${status.color}`}>
                      <StatusIcon size={14} />
                      <span>{status.label}</span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={16} className="mr-2" />
                      {request.location.city}, {request.location.state}
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar size={16} className="mr-2" />
                      {new Date(request.requestedDate).toLocaleDateString('pt-BR')}
                    </div>
                    {(request.price || request.negotiatedPrice) && (
                      <div className="flex items-center text-sm font-bold text-green-600 dark:text-green-400">
                        <DollarSign size={16} className="mr-2" />
                        R$ {request.negotiatedPrice || request.price}
                      </div>
                    )}
                  </div>

                  {isProvider && request.status === 'pending' && (
                    <div className="flex space-x-2 mt-4" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleAccept(request._id)}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold"
                      >
                        Aceitar
                      </button>
                      <button 
                        onClick={() => {
                          const reason = prompt('Motivo da rejeição:');
                          if (reason) handleReject(request._id, reason);
                        }}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-semibold"
                      >
                        Recusar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav 
        active="requests" 
        userType={props.userType}
        setCurrentScreen={props.setCurrentScreen}
      />
    </div>
  );
};

// Componente de detalhes (continua igual...)
const RequestDetails = ({ request, onBack, onAccept, onReject, onStart, onComplete, onCancel, userType, ...props }) => {
  const isProvider = userType === 'provider';
  const otherUser = isProvider ? request.requester : request.provider;

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <button onClick={onBack} className="mb-4 text-blue-600 flex items-center space-x-1">
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </button>
        <div className="bg-red-100 text-red-700 p-4 rounded-xl">
          Erro: Dados do usuário não encontrados
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Detalhes" {...props} />
      <div className="p-4 pb-20">
        <button onClick={onBack} className="mb-4 text-blue-600 flex items-center space-x-1">
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </button>

        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white mb-4">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{otherUser?.avatar || '👤'}</div>
            <div>
              <h2 className="text-2xl font-bold">{request.title}</h2>
              <p>{otherUser?.name || 'Usuário'}</p>
              <p className="text-sm opacity-75">{request.category}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">Descrição</h3>
          <p className="text-gray-600 dark:text-gray-400">{request.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">Localização</h3>
          <p className="text-gray-600 dark:text-gray-400">{request.location.address}</p>
          <p className="text-gray-600 dark:text-gray-400">{request.location.city}, {request.location.state}</p>
        </div>

        {isProvider && request.status === 'pending' && (
          <div className="space-y-2">
            <button 
              onClick={() => onAccept(request._id)}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold"
            >
              Aceitar Solicitação
            </button>
            <button 
              onClick={() => {
                const reason = prompt('Motivo da rejeição:');
                if (reason) onReject(request._id, reason);
              }}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold"
            >
              Rejeitar
            </button>
          </div>
        )}

        {isProvider && request.status === 'accepted' && (
          <button 
            onClick={() => onStart(request._id)}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold"
          >
            Iniciar Trabalho
          </button>
        )}

        {isProvider && request.status === 'in_progress' && (
          <button 
            onClick={() => onComplete(request._id)}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold"
          >
            Concluir Trabalho
          </button>
        )}

        {(request.status === 'pending' || request.status === 'accepted' || request.status === 'in_progress') && (
          <button 
            onClick={() => onCancel(request._id)}
            className="w-full bg-gray-500 text-white py-3 rounded-xl font-bold mt-2"
          >
            Cancelar Solicitação
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestsScreen;