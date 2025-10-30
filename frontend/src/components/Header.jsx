import React from 'react';
import { Menu, X, MessageSquare, Moon, Sun } from 'lucide-react';

const Header = ({ title, menuOpen, setMenuOpen, setCurrentScreen, darkMode, setDarkMode }) => (
  <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors">
    <div className="flex items-center justify-between p-4">
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-gray-800 dark:text-gray-200"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h1>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
        <MessageSquare size={24} className="text-gray-600 dark:text-gray-400" />
      </div>
    </div>
    
    {menuOpen && (
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4 space-y-2">
        <button 
          onClick={() => {
            setMenuOpen(false);
            setCurrentScreen('userSelection');
          }} 
          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-800 dark:text-gray-200"
        >
          Trocar Perfil
        </button>
        <button 
          onClick={() => {
            setMenuOpen(false);
            setCurrentScreen('settings');
          }}
          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-800 dark:text-gray-200"
        >
          Configurações
        </button>
        <button 
          onClick={() => {
            setMenuOpen(false);
            setCurrentScreen('userSelection');
          }}
          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-600 dark:text-red-400"
        >
          Sair
        </button>
      </div>
    )}
  </div>
);

export default Header;