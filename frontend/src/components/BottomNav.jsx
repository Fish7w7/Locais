import React from 'react';
import { Home, Search, Clock, User } from 'lucide-react';

const BottomNav = ({ active, userType, setCurrentScreen }) => {
  const handleHomeClick = () => {
    if (userType === 'client') setCurrentScreen('clientHome');
    else if (userType === 'provider') setCurrentScreen('providerHome');
    else if (userType === 'company') setCurrentScreen('companyHome');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg max-w-md mx-auto transition-colors">
      <div className="flex justify-around py-2">
        <button 
          onClick={handleHomeClick}
          className={`flex flex-col items-center p-2 transition-colors ${
            active === 'home' 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Início</span>
        </button>
        
        <button className={`flex flex-col items-center p-2 transition-colors ${
          active === 'search' 
            ? 'text-blue-500 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          <Search size={24} />
          <span className="text-xs mt-1">Buscar</span>
        </button>
        
        <button className={`flex flex-col items-center p-2 transition-colors ${
          active === 'requests' 
            ? 'text-blue-500 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400'
        }`}>
          <Clock size={24} />
          <span className="text-xs mt-1">Pedidos</span>
        </button>
        
        <button 
          onClick={() => setCurrentScreen('profile')}
          className={`flex flex-col items-center p-2 transition-colors ${
            active === 'profile' 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;