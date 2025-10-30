import React from 'react';
import { Briefcase, DollarSign, Star, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const ProviderHome = (props) => {
  const stats = {
    jobsThisMonth: 12,
    earnings: 2450,
    rating: 4.8,
    pendingRequests: 3
  };

  const recentJobs = [
    { id: 1, client: 'Ana Costa', service: 'Instalação elétrica', date: 'Hoje, 14h', status: 'pendente', price: 150 },
    { id: 2, client: 'Roberto Lima', service: 'Manutenção', date: 'Amanhã, 10h', status: 'confirmado', price: 120 },
    { id: 3, client: 'Julia Mendes', service: 'Reparo urgente', date: '28 Out', status: 'concluido', price: 200 }
  ];

  const statusColors = {
    pendente: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    confirmado: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    concluido: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <Header 
        title="Meu Negócio" 
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
        setCurrentScreen={props.setCurrentScreen}
        darkMode={props.darkMode}
        setDarkMode={props.setDarkMode}
      />

      <div className="p-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-4 rounded-xl text-white shadow-lg">
            <Briefcase size={24} className="mb-2" />
            <div className="text-2xl font-bold">{stats.jobsThisMonth}</div>
            <div className="text-sm opacity-90">Trabalhos este mês</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-4 rounded-xl text-white shadow-lg">
            <DollarSign size={24} className="mb-2" />
            <div className="text-2xl font-bold">R$ {stats.earnings}</div>
            <div className="text-sm opacity-90">Ganhos este mês</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 p-4 rounded-xl text-white shadow-lg">
            <Star size={24} className="mb-2" />
            <div className="text-2xl font-bold">{stats.rating}</div>
            <div className="text-sm opacity-90">Avaliação média</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 p-4 rounded-xl text-white shadow-lg">
            <TrendingUp size={24} className="mb-2" />
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <div className="text-sm opacity-90">Solicitações novas</div>
          </div>
        </div>

        {/* Trabalhos recentes */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Trabalhos Recentes</h2>
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-transparent dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{job.client}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.service}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[job.status]}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{job.date}</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">R$ {job.price}</span>
                </div>
                {job.status === 'pendente' && (
                  <div className="flex space-x-2 mt-3">
                    <button className="flex-1 bg-green-500 dark:bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-600 dark:hover:bg-green-700 transition-colors">
                      Aceitar
                    </button>
                    <button className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      Recusar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav 
        active="home" 
        userType={props.userType}
        setCurrentScreen={props.setCurrentScreen}
      />
    </div>
  );
};

export default ProviderHome;