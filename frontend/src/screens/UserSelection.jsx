import React from 'react';
import { User, Briefcase, Wrench, ChevronRight } from 'lucide-react';

const UserSelection = ({ setUserType, setCurrentScreen }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center p-4 transition-colors">
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">Bem-vindo!</h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Como você quer usar o app?</p>
      
      <div className="space-y-4">
        <button 
          onClick={() => { setUserType('client'); setCurrentScreen('clientHome'); }}
          className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-6 rounded-2xl flex items-center justify-between transition-all transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <User size={32} />
            <div className="text-left">
              <div className="font-bold text-lg">Cliente</div>
              <div className="text-sm opacity-90">Contratar serviços</div>
            </div>
          </div>
          <ChevronRight size={24} />
        </button>

        <button 
          onClick={() => { setUserType('provider'); setCurrentScreen('providerHome'); }}
          className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white p-6 rounded-2xl flex items-center justify-between transition-all transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <Wrench size={32} />
            <div className="text-left">
              <div className="font-bold text-lg">Prestador</div>
              <div className="text-sm opacity-90">Oferecer serviços</div>
            </div>
          </div>
          <ChevronRight size={24} />
        </button>

        <button 
          onClick={() => { setUserType('company'); setCurrentScreen('companyHome'); }}
          className="w-full bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white p-6 rounded-2xl flex items-center justify-between transition-all transform hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <Briefcase size={32} />
            <div className="text-left">
              <div className="font-bold text-lg">Empresa</div>
              <div className="text-sm opacity-90">Contratar e publicar vagas</div>
            </div>
          </div>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  </div>
);

export default UserSelection;