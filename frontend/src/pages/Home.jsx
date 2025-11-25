import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Search, TrendingUp, Users, FileText, Target } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getUserTypeLabel = (type) => {
    const labels = {
      client: 'Cliente',
      provider: 'Prestador',
      company: 'Empresa',
      admin: 'Administrador'
    };
    return labels[type] || type;
  };

  // Funções de navegação
  const handleBuscarPrestadores = () => {
    navigate('/services');
  };

  const handleVerVagas = () => {
    navigate('/jobs');
  };

  const handleMeusServicos = () => {
    navigate('/services', { state: { tab: 'received' } });
  };

  const handlePropostasRecebidas = () => {
    navigate('/jobs', { state: { tab: 'my-proposals' } });
  };

  const handleCriarVaga = () => {
    navigate('/jobs', { state: { openCreateModal: true } });
  };

  const handleGerenciarVagas = () => {
    navigate('/jobs', { state: { tab: 'my-jobs' } });
  };

  const handleGerenciarServicos = () => {
    navigate('/services', { state: { tab: 'my-requests' } });
  };

  const handlePainelAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Olá, {user?.name}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Você está logado como <span className="font-semibold text-primary-600 dark:text-primary-400">{getUserTypeLabel(user?.type)}</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Serviços</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Avaliações</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions based on user type */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ações Rápidas
        </h3>

        {/* ADMIN - Acesso total */}
        {user?.type === 'admin' && (
          <>
            <button 
              onClick={handleGerenciarVagas}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Gerenciar Vagas</span>
            </button>
            <button 
              onClick={handleGerenciarServicos}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="font-medium">Gerenciar Serviços</span>
            </button>
            <button 
              onClick={handlePainelAdmin}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Painel Admin</span>
            </button>
          </>
        )}

        {/* CLIENTE */}
        {user?.type === 'client' && (
          <>
            <button 
              onClick={handleBuscarPrestadores}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Search className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium block">Buscar Prestadores</span>
                <span className="text-xs text-primary-100">Encontre profissionais qualificados</span>
              </div>
            </button>
            <button 
              onClick={handleVerVagas}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium block">Ver Vagas Disponíveis</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Oportunidades de trabalho</span>
              </div>
            </button>
          </>
        )}

        {/* PRESTADOR */}
        {user?.type === 'provider' && (
          <>
            <button 
              onClick={handleMeusServicos}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium block">Meus Serviços</span>
                <span className="text-xs text-primary-100">Gerencie suas solicitações</span>
              </div>
            </button>
            <button 
              onClick={handlePropostasRecebidas}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium block">Propostas Recebidas</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Oportunidades de vagas</span>
              </div>
            </button>
          </>
        )}

        {/* EMPRESA */}
        {user?.type === 'company' && (
          <>
            <button 
              onClick={handleCriarVaga}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium block">Criar Nova Vaga</span>
                <span className="text-xs text-primary-100">Publique oportunidades de trabalho</span>
              </div>
            </button>
            <button 
              onClick={handleBuscarPrestadores}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Search className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium block">Buscar Prestadores</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Encontre profissionais</span>
              </div>
            </button>
            <button 
              onClick={handleGerenciarVagas}
              className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors"
            >
              <Users className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium block">Minhas Vagas</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Gerencie candidaturas</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Atividade Recente
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          Nenhuma atividade recente
        </p>
      </div>
    </div>
  );
};

export default Home;