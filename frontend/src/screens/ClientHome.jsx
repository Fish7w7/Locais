import React from 'react';
import { Search, Star } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { categories, providers } from '../utils/mockData';

const ClientHome = (props) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <Header 
        title="Contratar Serviços" 
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
        setCurrentScreen={props.setCurrentScreen}
        darkMode={props.darkMode}
        setDarkMode={props.setDarkMode}
      />

      <div className="p-4">
        {/* Barra de busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar serviços..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Categorias */}
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Categorias</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.map(cat => (
              <button 
                key={cat.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-center border border-transparent dark:border-gray-700"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{cat.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{cat.count} profissionais</div>
              </button>
            ))}
          </div>
        </div>

        {/* Profissionais em destaque */}
        <div>
          <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">Profissionais em Destaque</h2>
          <div className="space-y-3">
            {providers.map(provider => (
              <div key={provider.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-transparent dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="text-4xl">{provider.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">{provider.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{provider.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm ml-1 text-gray-700 dark:text-gray-300">{provider.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">({provider.reviews} avaliações)</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">R$ {provider.price}/h</span>
                      <button className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors">
                        Contratar
                      </button>
                    </div>
                  </div>
                </div>
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

export default ClientHome;