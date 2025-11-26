// frontend/src/contexts/NotificationContext.jsx
import { createContext, useContext, useState } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (message) => addNotification(message, 'success');
  const error = (message) => addNotification(message, 'error');
  const info = (message) => addNotification(message, 'info');
  const warning = (message) => addNotification(message, 'warning');

  const getIcon = (type) => {
    const icons = {
      success: CheckCircle,
      error: XCircle,
      info: Info,
      warning: AlertCircle
    };
    return icons[type] || Info;
  };

  const getColors = (type) => {
    const colors = {
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    };
    return colors[type] || colors.info;
  };

  return (
    <NotificationContext.Provider value={{ success, error, info, warning }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map(notification => {
          const Icon = getIcon(notification.type);
          return (
            <div
              key={notification.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${getColors(notification.type)}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="flex-1 text-sm font-medium">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 hover:opacity-70 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

// Se vc Quiser usar em algum componente, importe o hook assim:
// import { useNotification } from '../contexts/NotificationContext';
// const { success, error } = useNotification();
// success('Operação realizada com sucesso!');
// error('Algo deu errado!');