import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { notificationAPI } from '../api/services';
import { useAuth } from './AuthContext';

const ActivityNotificationContext = createContext();

export const useActivityNotifications = () => {
  const context = useContext(ActivityNotificationContext);
  if (!context) {
    throw new Error('useActivityNotifications deve ser usado dentro de ActivityNotificationProvider');
  }
  return context;
};

const emptyCounts = { services: 0,
  jobs: 0,
  receivedServices: 0,
  jobProposals: 0,
  jobApplications: 0
};

export const ActivityNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [counts, setCounts] = useState(emptyCounts);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const refreshActivityNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCounts(emptyCounts);
      setLastCheckedAt(null);
      return emptyCounts;
    }

    try {
      const response = await notificationAPI.getSummary();
      const summary = response.data.notifications || {};
      const nextCounts = { services: Number(summary.services || 0),
        jobs: Number(summary.jobs || 0),
        receivedServices: Number(summary.pendingServices || 0),
        jobProposals: Number(summary.pendingProposals || 0),
        jobApplications: Number(summary.pendingApplications || 0)
      };

      setCounts(nextCounts);
      setLastCheckedAt(new Date());
      return nextCounts;
    } catch (error) {
      console.error('Erro ao atualizar notificações de atividade:', error);
      return emptyCounts;
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCounts(emptyCounts);
      setLastCheckedAt(null);
      return;
    }

    refreshActivityNotifications();

    const intervalId = window.setInterval(refreshActivityNotifications, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshActivityNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, refreshActivityNotifications, user]);

  return (
    <ActivityNotificationContext.Provider
      value={{
        counts,
        lastCheckedAt,
        refreshActivityNotifications
      }}
    >
      {children}
    </ActivityNotificationContext.Provider>
  );
};
