import React from 'react';
import { MapPin, ChevronLeft, Briefcase } from 'lucide-react';
import Header from '../components/Header';
import { jobs } from '../utils/mockData';

const JobsList = (props) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        title="Vagas Disponíveis" 
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
        setCurrentScreen={props.setCurrentScreen}
        darkMode={props.darkMode}
        setDarkMode={props.setDarkMode}
      />

      <div className="p-4">
        {/* Botão Voltar */}
        <button 
          onClick={() => props.setCurrentScreen('clientHome')}
          className="mb-4 text-blue-600 dark:text-blue-400 flex items-center space-x-1 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Voltar</span>
        </button>

        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white p-6 rounded-2xl mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-2">💼 Oportunidades</h2>
          <p className="opacity-90">Vagas disponíveis em empresas locais</p>
        </div>

        {/* Lista de Vagas */}
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-transparent dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                    <Briefcase size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{job.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
                  </div>
                </div>
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-semibold">
                  {job.type}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <MapPin size={16} />
                <span>{job.location}</span>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">{job.salary}</span>
                <button className="bg-purple-500 dark:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 dark:hover:bg-purple-700 transition-colors">
                  Candidatar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há mais vagas */}
        {jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Nenhuma vaga disponível</h3>
            <p className="text-gray-600 dark:text-gray-400">Novas oportunidades em breve!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;