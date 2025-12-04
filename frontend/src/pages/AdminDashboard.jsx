import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, CheckCircle, TrendingUp, Building2, UserCheck, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import ReviewModerationStats from '../components/ReviewModerationStats';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
    loadPendingReviewsCount();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data.stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingReviewsCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reviews/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPendingReviewsCount(response.data.count || response.data.reviews?.length || 0);
    } catch (err) {
      console.error('Erro ao carregar contagem de avaliações:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Admin
        </h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Admin
        </h1>
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={loadStats}>Tentar Novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'Usuários cadastrados'
    },
    {
      title: 'Clientes',
      value: stats?.users?.clients || 0,
      icon: UserCheck,
      color: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'Usuários clientes'
    },
    {
      title: 'Prestadores',
      value: stats?.users?.providers || 0,
      icon: Briefcase,
      color: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'Prestadores de serviço'
    },
    {
      title: 'Empresas',
      value: stats?.users?.companies || 0,
      icon: Building2,
      color: 'bg-orange-100 dark:bg-orange-900',
      iconColor: 'text-orange-600 dark:text-orange-400',
      description: 'Empresas cadastradas'
    },
    {
      title: 'Serviços Solicitados',
      value: stats?.services || 0,
      icon: CheckCircle,
      color: 'bg-cyan-100 dark:bg-cyan-900',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      description: 'Total de solicitações'
    },
    {
      title: 'Vagas Publicadas',
      value: stats?.jobs || 0,
      icon: Briefcase,
      color: 'bg-pink-100 dark:bg-pink-900',
      iconColor: 'text-pink-600 dark:text-pink-400',
      description: 'Vagas de emprego'
    },
    {
      title: 'Candidaturas',
      value: stats?.applications || 0,
      icon: Clock,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      description: 'Candidaturas a vagas'
    },
    {
      title: 'Propostas Enviadas',
      value: stats?.proposals || 0,
      icon: TrendingUp,
      color: 'bg-indigo-100 dark:bg-indigo-900',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Propostas de trabalho'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral do sistema
          </p>
        </div>
        <Button size="sm" onClick={() => {
          loadStats();
          loadPendingReviewsCount();
        }}>
          Atualizar
        </Button>
      </div>

      {/* ALERTA DE AVALIAÇÕES PENDENTES */}
      {pendingReviewsCount > 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <MessageSquare className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {pendingReviewsCount} {pendingReviewsCount === 1 ? 'avaliação pendente' : 'avaliações pendentes'}
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Avaliações aguardando moderação
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => navigate('/admin/reviews')}
            >
              Moderar
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {stat.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

        {/* Estatísticas da moderação de avaliações */}
        <ReviewModerationStats />

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribuição de Usuários */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição de Usuários
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.users?.clients || 0}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats?.users?.total ? ((stats.users.clients / stats.users.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Prestadores</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.users?.providers || 0}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats?.users?.total ? ((stats.users.providers / stats.users.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Empresas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.users?.companies || 0}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats?.users?.total ? ((stats.users.companies / stats.users.total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div 
                  className="bg-green-500 h-full"
                  style={{ width: `${stats?.users?.total ? (stats.users.clients / stats.users.total) * 100 : 0}%` }}
                ></div>
                <div 
                  className="bg-purple-500 h-full"
                  style={{ width: `${stats?.users?.total ? (stats.users.providers / stats.users.total) * 100 : 0}%` }}
                ></div>
                <div 
                  className="bg-orange-500 h-full"
                  style={{ width: `${stats?.users?.total ? (stats.users.companies / stats.users.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Atividade do Sistema */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Atividade do Sistema
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Serviços</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats?.services || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Vagas</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats?.jobs || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Candidaturas</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats?.applications || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Propostas</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {stats?.proposals || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            fullWidth
            onClick={() => navigate('/admin/users')}
          >
            Gerenciar Usuários
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            fullWidth
            onClick={() => navigate('/admin/reviews')}
          >
            Moderar Avaliações
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            fullWidth
            onClick={() => navigate('/jobs')}
          >
            Gerenciar Vagas
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            fullWidth
            onClick={() => navigate('/services')}
          >
            Gerenciar Serviços
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;