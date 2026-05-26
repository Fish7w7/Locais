// frontend/src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Search, User, Users, Moon, Sun, Shield, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useChatNotifications } from '../contexts/ChatNotificationContext';
import { useActivityNotifications } from '../contexts/ActivityNotificationContext';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { totalUnread } = useChatNotifications();
  const { counts: activityCounts } = useActivityNotifications();

  const isAdmin = user?.type === 'admin' || user?.role === 'admin';
  const userType = user?.type;

  const navItems = getNavItems(userType, isAdmin);

  // Adiciona aba Admin se for admin
  if (isAdmin) {
    navItems.push({ key: 'admin', path: '/admin', icon: Shield, label: 'Admin' });
  }

  const getNavBadgeCount = (badge) => {
    if (badge === 'chat') return totalUnread;
    if (badge === 'services') return activityCounts.services;
    if (badge === 'jobs') return activityCounts.jobs;
    if (badge === 'candidates') return activityCounts.jobApplications;
    return 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="container-mobile mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Serviços Locais
          </h1>
          
          <div className="flex items-center gap-2">
            {/* Admin Badge */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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
            {navItems.map(({ key, path, state, activeView, icon: Icon, label, badge }) => {
              const isActive = location.pathname === path
                && (!activeView || location.state?.view === activeView || (key === 'publications' && !location.state?.view));
              const badgeCount = getNavBadgeCount(badge);
              return (
                <button
                  key={key}
                  onClick={() => navigate(path, state ? { state } : undefined)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
                  }`}
                >
                  <span className="relative">
                    <Icon className="w-6 h-6" />
                    {badgeCount > 0 && (
                      <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] leading-[18px] font-bold shadow-sm ring-2 ring-white dark:ring-gray-800">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </span>
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

const getNavItems = (userType, isAdmin) => {
  if (isAdmin) {
    return [
      { key: 'home', path: '/', icon: Home, label: 'Início' },
      { key: 'services', path: '/services', icon: Search, label: 'Serviços', badge: 'services' },
      { key: 'jobs', path: '/jobs', icon: Briefcase, label: 'Vagas', badge: 'jobs' },
      { key: 'chat', path: '/chat', icon: MessageCircle, label: 'Chat', badge: 'chat' },
      { key: 'profile', path: '/profile', icon: User, label: 'Perfil' }
    ];
  }

  if (userType === 'company') {
    return [
      { key: 'home', path: '/', icon: Home, label: 'Início' },
      { key: 'publications', path: '/jobs', state: { tab: 'my-jobs', view: 'publications' }, activeView: 'publications', icon: Briefcase, label: 'Publicações' },
      { key: 'candidates', path: '/jobs', state: { tab: 'my-jobs', view: 'candidates' }, activeView: 'candidates', icon: Users, label: 'Candidatos', badge: 'candidates' },
      { key: 'chat', path: '/chat', icon: MessageCircle, label: 'Chat', badge: 'chat' },
      { key: 'profile', path: '/profile', icon: User, label: 'Perfil' }
    ];
  }

  if (userType === 'provider') {
    return [
      { key: 'home', path: '/', icon: Home, label: 'Início' },
      { key: 'services', path: '/services', state: { tab: 'received' }, icon: Search, label: 'Serviços', badge: 'services' },
      { key: 'jobs', path: '/jobs', icon: Briefcase, label: 'Vagas', badge: 'jobs' },
      { key: 'chat', path: '/chat', icon: MessageCircle, label: 'Chat', badge: 'chat' },
      { key: 'profile', path: '/profile', icon: User, label: 'Perfil' }
    ];
  }

  return [
    { key: 'home', path: '/', icon: Home, label: 'Início' },
    { key: 'services', path: '/services', icon: Search, label: 'Serviços', badge: 'services' },
    { key: 'chat', path: '/chat', icon: MessageCircle, label: 'Chat', badge: 'chat' },
    { key: 'profile', path: '/profile', icon: User, label: 'Perfil' }
  ];
};

export default Layout;
