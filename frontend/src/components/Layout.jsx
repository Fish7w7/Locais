import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Search, User, Moon, Sun, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const isAdmin = user?.type === 'admin' || user?.role === 'admin';

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/services', icon: Search, label: 'Serviços' },
    { path: '/jobs', icon: Briefcase, label: 'Vagas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header - CORRIGIDO */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10 safe-area-top">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 truncate">
            Serviços Locais
          </h1>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <Shield className="w-3 h-3 flex-shrink-0" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
              aria-label="Alternar tema"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - CORRIGIDO */}
      <main className="pt-16 pb-2 safe-area-top safe-area-bottom">
        <div className="max-w-full mx-auto px-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation - CORRIGIDO */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10 safe-area-bottom">
        <div className="max-w-full mx-auto">
          <div className="flex justify-around items-center py-2 px-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors flex-1 min-w-0 ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="text-xs font-medium truncate max-w-full">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;