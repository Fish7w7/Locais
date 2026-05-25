import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Users
} from 'lucide-react';
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
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const nextStats = response.data.stats || response.data;
      setStats(nextStats);
      setPendingReviewsCount(nextStats.pendingReviews || 0);
    } catch (err) {
      console.error('Erro ao carregar estatisticas:', err);
      setError('Erro ao carregar estatisticas');
    } finally {
      setLoading(false);
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando estatisticas...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Admin
        </h1>
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Dados indisponiveis'}</p>
            <Button onClick={loadStats}>Tentar Novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  const users = stats.users || {};
  const totalWithoutAdmins = (users.clients || 0) + (users.providers || 0) + (users.companies || 0);
  const percentage = (value) => (totalWithoutAdmins ? ((value / totalWithoutAdmins) * 100).toFixed(1) : 0);

  const statCards = [
    {
      title: 'Total de Usuarios',
      value: totalWithoutAdmins,
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'Usuarios cadastrados'
    },
    {
      title: 'Clientes',
      value: users.clients || 0,
      icon: UserCheck,
      color: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
      description: 'Usuarios clientes'
    },
    {
      title: 'Prestadores',
      value: users.providers || 0,
      icon: Briefcase,
      color: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
      description: 'Prestadores de servico'
    },
    {
      title: 'Empresas',
      value: users.companies || 0,
      icon: Building2,
      color: 'bg-orange-100 dark:bg-orange-900',
      iconColor: 'text-orange-600 dark:text-orange-400',
      description: 'Empresas cadastradas'
    },
    {
      title: 'Servicos Solicitados',
      value: stats.services || 0,
      icon: CheckCircle,
      color: 'bg-cyan-100 dark:bg-cyan-900',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      description: 'Total de solicitacoes'
    },
    {
      title: 'Vagas Publicadas',
      value: stats.jobs || 0,
      icon: Briefcase,
      color: 'bg-pink-100 dark:bg-pink-900',
      iconColor: 'text-pink-600 dark:text-pink-400',
      description: 'Vagas de emprego'
    },
    {
      title: 'Candidaturas',
      value: stats.applications || 0,
      icon: Clock,
      color: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      description: 'Candidaturas a vagas'
    },
    {
      title: 'Propostas Enviadas',
      value: stats.proposals || 0,
      icon: TrendingUp,
      color: 'bg-indigo-100 dark:bg-indigo-900',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Propostas de trabalho'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visao geral do sistema
          </p>
        </div>
        <Button size="sm" onClick={loadStats}>
          Atualizar
        </Button>
      </div>

      {pendingReviewsCount > 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <MessageSquare className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {pendingReviewsCount} {pendingReviewsCount === 1 ? 'avaliacao pendente' : 'avaliacoes pendentes'}
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Avaliacoes aguardando moderacao
                </p>
              </div>
            </div>
            <Button size="sm" variant="primary" onClick={() => navigate('/admin/reviews')}>
              Moderar
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ReviewModerationStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuicao de Usuarios
          </h3>
          <div className="space-y-3">
            <UserShareRow label="Clientes" value={users.clients || 0} color="bg-green-500" percent={percentage(users.clients || 0)} />
            <UserShareRow label="Prestadores" value={users.providers || 0} color="bg-purple-500" percent={percentage(users.providers || 0)} />
            <UserShareRow label="Empresas" value={users.companies || 0} color="bg-orange-500" percent={percentage(users.companies || 0)} />

            <div className="pt-2">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full" style={{ width: `${percentage(users.clients || 0)}%` }} />
                <div className="bg-purple-500 h-full" style={{ width: `${percentage(users.providers || 0)}%` }} />
                <div className="bg-orange-500 h-full" style={{ width: `${percentage(users.companies || 0)}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Atividade do Sistema
          </h3>
          <div className="space-y-4">
            <ActivityRow icon={CheckCircle} label="Servicos" value={stats.services || 0} color="text-cyan-600 dark:text-cyan-400" />
            <ActivityRow icon={Briefcase} label="Vagas" value={stats.jobs || 0} color="text-pink-600 dark:text-pink-400" />
            <ActivityRow icon={Clock} label="Candidaturas" value={stats.applications || 0} color="text-yellow-600 dark:text-yellow-400" />
            <ActivityRow icon={TrendingUp} label="Propostas" value={stats.proposals || 0} color="text-indigo-600 dark:text-indigo-400" />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acoes Rapidas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/admin/users')}>
            Gerenciar Usuarios
          </Button>
          <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/admin/reviews')}>
            Moderar Avaliacoes
          </Button>
          <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/jobs')}>
            Gerenciar Vagas
          </Button>
          <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/services')}>
            Gerenciar Servicos
          </Button>
        </div>
      </Card>
    </div>
  );
};

const UserShareRow = ({ label, value, color, percent }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
      <span className="text-xs text-gray-500">({percent}%)</span>
    </div>
  </div>
);

const ActivityRow = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div className="flex items-center gap-3">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
    <span className="font-bold text-gray-900 dark:text-white">{value}</span>
  </div>
);

export default AdminDashboard;
