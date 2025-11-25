import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Search, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/services', icon: Search, label: 'Serviços' },
    { path: '/jobs', icon: Briefcase, label: 'Vagas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container-mobile mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Serviços Locais
          </h1>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Alternar tema"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-4">
        <div className="container-mobile mx-auto px-4">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
        <div className="container-mobile mx-auto">
          <div className="flex justify-around items-center py-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{label}</span>
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