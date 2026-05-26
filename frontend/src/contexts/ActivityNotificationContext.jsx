import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  jobApplications: 0,
  myServiceRequests: 0,
  myJobApplications: 0
};

export const ActivityNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [counts, setCounts] = useState(emptyCounts);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  const refreshActivityNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCounts(emptyCounts);
      setLastCheckedAt(null);
      setIsLoading(false);
      setHasLoaded(true);
      hasLoadedRef.current = true;
      return emptyCounts;
    }

    const isInitialLoad = !hasLoadedRef.current;
    if (isInitialLoad) {
      setIsLoading(true);
    }

    try {
      const response = await notificationAPI.getSummary();
      const summary = response.data.notifications || {};
      const nextCounts = { services: Number(summary.services || 0),
        jobs: Number(summary.jobs || 0),
        receivedServices: Number(summary.pendingServices || 0),
        jobProposals: Number(summary.pendingProposals || 0),
        jobApplications: Number(summary.pendingApplications || 0),
        myServiceRequests: Number(summary.clientServices || 0),
        myJobApplications: Number(summary.clientApplications || 0)
      };

      setCounts(nextCounts);
      setLastCheckedAt(new Date());
      hasLoadedRef.current = true;
      setHasLoaded(true);
      return nextCounts;
    } catch (error) {
      console.error('Erro ao atualizar notificações de atividade:', error);
      hasLoadedRef.current = true;
      setHasLoaded(true);
      return emptyCounts;
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setCounts(emptyCounts);
      setLastCheckedAt(null);
      setIsLoading(false);
      setHasLoaded(true);
      hasLoadedRef.current = true;
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
        isLoading,
        hasLoaded,
        lastCheckedAt,
        refreshActivityNotifications
      }}
    >
      {children}
    </ActivityNotificationContext.Provider>
  );
};
