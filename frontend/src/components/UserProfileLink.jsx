// frontend/src/components/UserProfileLink.jsx 
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Componente clicável que leva ao perfil público do usuário
 * 
 * @param {string} userId - ID do usuário
 * @param {string} userName - Nome do usuário
 * @param {string} userAvatar - URL do avatar (opcional)
 * @param {string} subtitle - Texto secundário (opcional)
 * @param {boolean} showArrow - Mostrar seta de navegação (padrão: true)
 * @param {string} className - Classes CSS adicionais
 */
const UserProfileLink = ({ 
  userId, 
  userName, 
  userAvatar, 
  subtitle,
  showArrow = true,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation(); // Evita conflito com outros cliques
    navigate(`/user/${userId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors text-left w-full min-h-[44px] touch-manipulation ${className}`}
    >
      <img
        src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`}
        alt={userName}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {userName}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {showArrow && (
        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
    </button>
  );
};

export default UserProfileLink;