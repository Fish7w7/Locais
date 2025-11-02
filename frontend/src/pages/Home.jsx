import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Search, TrendingUp } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const getUserTypeLabel = (type) => {
    const labels = {
      client: 'Cliente',
      provider: 'Prestador',
      company: 'Empresa'
    };
    return labels[type] || type;
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

      {user?.type === 'admin' && (
  <>
    <button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors">
      <Briefcase className="w-5 h-5" />
      <span className="font-medium">Gerenciar Vagas</span>
    </button>
    <button className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
      <Search className="w-5 h-5" />
      <span className="font-medium">Gerenciar Serviços</span>
    </button>
    <button className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
      <TrendingUp className="w-5 h-5" />
      <span className="font-medium">Painel Admin</span>
    </button>
  </>
)}


      {/* Actions based on user type */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Ações Rápidas
        </h3>

        {user?.type === 'client' && (
          <>
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Search className="w-5 h-5" />
              <span className="font-medium">Buscar Prestadores</span>
            </button>
            <button className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Ver Vagas Disponíveis</span>
            </button>
          </>
        )}

        {user?.type === 'provider' && (
          <>
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Meus Serviços</span>
            </button>
            <button className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Search className="w-5 h-5" />
              <span className="font-medium">Propostas Recebidas</span>
            </button>
          </>
        )}

        {user?.type === 'company' && (
          <>
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Criar Nova Vaga</span>
            </button>
            <button className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3 transition-colors">
              <Search className="w-5 h-5" />
              <span className="font-medium">Buscar Prestadores</span>
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