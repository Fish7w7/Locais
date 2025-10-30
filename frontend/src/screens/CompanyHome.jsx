import React from 'react';
import { Briefcase, Wrench, Star, Users } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { providers } from '../utils/mockData';

const CompanyHome = (props) => {
  const myJobs = [
    { id: 1, title: 'Vendedor', type: 'Temporário', duration: '3 meses', candidates: 18, status: 'ativa' },
    { id: 2, title: 'Caixa', type: 'Efetiva', duration: 'Indeterminado', candidates: 12, status: 'ativa' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <Header 
        title="Empresa" 
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
        setCurrentScreen={props.setCurrentScreen}
        darkMode={props.darkMode}
        setDarkMode={props.setDarkMode}
      />

      <div className="p-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Briefcase size={32} className="mb-2" />
            <div className="font-bold text-lg">Publicar Vaga</div>
            <div className="text-sm opacity-90 mt-1">Encontre talentos</div>
          </button>
          
          <button className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Wrench size={32} className="mb-2" />
            <div className="font-bold text-lg">Contratar Serviço</div>
            <div className="text-sm opacity-90 mt-1">Profissionais locais</div>
          </button>
        </div>

        {/* Minhas Vagas */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Minhas Vagas</h2>
          <div className="space-y-3">
            {myJobs.map(job => (
              <div key={job.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-transparent dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.type} - {job.duration}</p>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Users size={16} />
                    <span className="text-sm">{job.candidates} candidatos</span>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-300">
                    Ver candidatos →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prestadores Favoritos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Prestadores Favoritos</h2>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-semibold">Ver todos</button>
          </div>
          <div className="space-y-3">
            {providers.slice(0, 2).map(provider => (
              <div key={provider.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex items-center space-x-3 border border-transparent dark:border-gray-700">
                <div className="text-3xl">{provider.avatar}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 dark:text-white">{provider.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{provider.category}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{provider.rating}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">({provider.reviews})</span>
                  </div>
                </div>
                <button className="bg-purple-500 dark:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors">
                  Convidar
                </button>
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

export default CompanyHome;