import React from 'react';
import { Mail, Phone, Calendar, Star, Award, Briefcase, Edit } from 'lucide-react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { currentUser } from '../utils/mockData';

const ProfileScreen = (props) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <Header 
        title="Meu Perfil" 
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
        setCurrentScreen={props.setCurrentScreen}
        darkMode={props.darkMode}
        setDarkMode={props.setDarkMode}
      />

      <div className="p-4">
        {/* Cabeçalho do Perfil */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-2xl p-6 text-white mb-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="text-6xl bg-white/20 p-4 rounded-full">
              {currentUser.avatar}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{currentUser.name}</h2>
              <p className="opacity-90">{currentUser.category}</p>
              <div className="flex items-center space-x-1 mt-2">
                <Star size={16} fill="white" />
                <span className="font-semibold">{currentUser.rating}</span>
                <span className="opacity-90 text-sm">({currentUser.totalReviews} avaliações)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl text-center shadow-sm border border-transparent dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{currentUser.completedJobs}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Trabalhos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl text-center shadow-sm border border-transparent dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{currentUser.rating}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avaliação</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl text-center shadow-sm border border-transparent dark:border-gray-700">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">R$ {currentUser.pricePerHour}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Por hora</div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 border border-transparent dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white">Informações</h3>
            <button className="text-blue-600 dark:text-blue-400 p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Edit size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Mail size={18} className="text-gray-400" />
              <span className="text-sm">{currentUser.email}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Phone size={18} className="text-gray-400" />
              <span className="text-sm">{currentUser.phone}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-sm">Membro desde {currentUser.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 border border-transparent dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">Sobre mim</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{currentUser.bio}</p>
        </div>

        {/* Habilidades */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-4 border border-transparent dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Award size={20} className="text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-gray-800 dark:text-white">Habilidades</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Portfólio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-transparent dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-gray-800 dark:text-white">Portfólio</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {currentUser.portfolio.map(item => (
              <div key={item.id} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-4xl hover:shadow-md transition-shadow cursor-pointer">
                {item.image}
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav 
        active="profile" 
        userType={props.userType}
        setCurrentScreen={props.setCurrentScreen}
      />
    </div>
  );
};

export default ProfileScreen;