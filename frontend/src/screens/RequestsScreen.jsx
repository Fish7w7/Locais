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

// Configuração da API
const API_URL = 'http://localhost:5000/api';

const RequestsScreen = (props) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Carregar solicitações (useCallback para evitar warning)
  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API_URL}/requests`, { params });
      setRequests(response.data.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar solicitações. Verifique se o backend está rodando.');
      console.error('Erro ao buscar requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Aceitar solicitação
  const handleAccept = async (requestId, negotiatedPrice = null) => {
    try {
      const body = negotiatedPrice ? { negotiatedPrice } : {};
      await axios.put(`${API_URL}/requests/${requestId}/accept`, body);
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert('Erro ao aceitar solicitação');
      console.error(err);
    }
  };

  // Rejeitar solicitação
  const handleReject = async (requestId, reason = '') => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/reject`, { reason });
      fetchRequests();
      setSelectedRequest(null);
    } catch (err) {
      alert('Erro ao rejeitar solicitação');
      console.error(err);
    }
  };

  // Iniciar trabalho
  const handleStart = async (requestId) => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/start`);
      fetchRequests();
    } catch (err) {
      alert('Erro ao iniciar trabalho');
      console.error(err);
    }
  };

  // Concluir trabalho
  const handleComplete = async (requestId) => {
    try {
      await axios.put(`${API_URL}/requests/${requestId}/complete`);
      fetchRequests();
    } catch (err) {
      alert('Erro ao concluir trabalho');
      console.error(err);
    }
  };

  // Cancelar solicitação
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
      alert('Erro ao cancelar solicitação');
      console.error(err);
    }
  };

  // Status Config
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

  // Filtros
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
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
            <button 
              onClick={fetchRequests}
              className="block mt-2 text-sm underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista de Solicitações */}
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Nenhuma solicitação
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? 'Você ainda não tem solicitações' 
                : `Nenhuma solicitação ${filters.find(f => f.id === filter)?.label.toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(request => {
              const status = statusConfig[request.status];
              const StatusIcon = status.icon;
              const isProvider = props.userType === 'provider';
              const otherUser = isProvider ? request.requester : request.provider;

              // Se otherUser for null, pular este request
              if (!otherUser) {
                console.warn('Request sem usuário associado:', request._id);
                return null;
              }

              return (
                <div 
                  key={request._id}
                  onClick={() => setSelectedRequest(request)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-transparent dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-3xl">
                        {otherUser?.avatar || '👤'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 dark:text-white">
                          {request.title}
                        </h3>
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

                  {/* Info */}
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

                  {/* Actions */}
                  {isProvider && request.status === 'pending' && (
                    <div className="flex space-x-2 mt-4" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handleAccept(request._id)}
                        className="flex-1 bg-green-500 dark:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                      >
                        Aceitar
                      </button>
                      <button 
                        onClick={() => {
                          const reason = prompt('Motivo da rejeição (opcional):');
                          handleReject(request._id, reason || '');
                        }}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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

// Componente de Detalhes
const RequestDetails = ({ 
  request, 
  onBack, 
  onAccept, 
  onReject, 
  onStart, 
  onComplete, 
  onCancel,
  userType,
  ...props 
}) => {
  const isProvider = userType === 'provider';
  const otherUser = isProvider ? request.requester : request.provider;

  // Se não tiver otherUser, mostrar erro
  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <button 
          onClick={onBack}
          className="mb-4 text-blue-600 dark:text-blue-400 flex items-center space-x-1 font-semibold"
        >
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </button>
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-xl">
          Erro: Dados do usuário não encontrados
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        title="Detalhes da Solicitação" 
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
        setCurrentScreen={props.setCurrentScreen}
        darkMode={props.darkMode}
        setDarkMode={props.setDarkMode}
      />

      <div className="p-4 pb-20">
        <button 
          onClick={onBack}
          className="mb-4 text-blue-600 dark:text-blue-400 flex items-center space-x-1 font-semibold"
        >
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </button>

        {/* Cabeçalho */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl p-6 text-white mb-4 shadow-lg">
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-5xl">{otherUser?.avatar || '👤'}</div>
            <div>
              <h2 className="text-2xl font-bold">{request.title}</h2>
              <p className="opacity-90">{otherUser?.name || 'Usuário'}</p>
              <p className="text-sm opacity-75">{request.category}</p>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm border border-transparent dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">Descrição</h3>
          <p className="text-gray-600 dark:text-gray-400">{request.description}</p>
        </div>

        {/* Localização */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm border border-transparent dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">Localização</h3>
          <p className="text-gray-600 dark:text-gray-400">{request.location.address}</p>
          <p className="text-gray-600 dark:text-gray-400">{request.location.city}, {request.location.state}</p>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-transparent dark:border-gray-700">
            <Calendar size={20} className="text-blue-500 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Data</p>
            <p className="font-bold text-gray-800 dark:text-white">
              {new Date(request.requestedDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          {(request.price || request.negotiatedPrice) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-transparent dark:border-gray-700">
              <DollarSign size={20} className="text-green-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor</p>
              <p className="font-bold text-gray-800 dark:text-white">
                R$ {request.negotiatedPrice || request.price}
              </p>
            </div>
          )}
        </div>

        {/* Ações */}
        {isProvider && request.status === 'pending' && (
          <div className="space-y-2">
            <button 
              onClick={() => onAccept(request._id)}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
            >
              Aceitar Solicitação
            </button>
            <button 
              onClick={() => {
                const reason = prompt('Motivo da rejeição:');
                if (reason) onReject(request._id, reason);
              }}
              className="w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              Rejeitar
            </button>
          </div>
        )}

        {isProvider && request.status === 'accepted' && (
          <button 
            onClick={() => onStart(request._id)}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
          >
            Iniciar Trabalho
          </button>
        )}

        {isProvider && request.status === 'in_progress' && (
          <button 
            onClick={() => onComplete(request._id)}
            className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
          >
            Concluir Trabalho
          </button>
        )}

        {(request.status === 'pending' || request.status === 'accepted' || request.status === 'in_progress') && (
          <button 
            onClick={() => onCancel(request._id)}
            className="w-full bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition-colors mt-2"
          >
            Cancelar Solicitação
          </button>
        )}
      </div>
    </div>
  );
};

export default RequestsScreen;