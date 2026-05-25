import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { chatAPI, notificationAPI } from '../api/services';
import { useAuth } from './AuthContext';

const ChatNotificationContext = createContext();

export const useChatNotifications = () => {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error('useChatNotifications deve ser usado dentro de ChatNotificationProvider');
  }
  return context;
};

const countUnread = (conversations = []) =>
  conversations.reduce((total, conversation) => total + Number(conversation.unreadCount || 0), 0);

export const ChatNotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const syncFromConversations = useCallback((conversations) => {
    setConversations(conversations);
    setTotalUnread(countUnread(conversations));
    setLastCheckedAt(new Date());
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setTotalUnread(0);
      setLastCheckedAt(null);
      return 0;
    }

    try {
      const response = await notificationAPI.getSummary();
      const unreadCount = Number(response.data.notifications.chatUnread || 0);
      setTotalUnread(unreadCount);
      setLastCheckedAt(new Date());
      return unreadCount;
    } catch (error) {
      console.error('Erro ao atualizar notificações do chat:', error);
      return 0;
    }
  }, [isAuthenticated]);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setTotalUnread(0);
      setLastCheckedAt(null);
      return [];
    }

    try {
      const response = await chatAPI.getMyConversations();
      const loadedConversations = response.data.conversations || [];
      syncFromConversations(loadedConversations);
      return loadedConversations;
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      return [];
    }
  }, [isAuthenticated, syncFromConversations]);

  useEffect(() => {
    if (!isAuthenticated) {
      setConversations([]);
      setTotalUnread(0);
      setLastCheckedAt(null);
      return;
    }

    refreshUnreadCount();

    const intervalId = window.setInterval(refreshUnreadCount, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, refreshUnreadCount]);

  return (
    <ChatNotificationContext.Provider
      value={{
        conversations,
        totalUnread,
        hasUnread: totalUnread > 0,
        lastCheckedAt,
        refreshUnreadCount,
        loadConversations,
        syncFromConversations
      }}
    >
      {children}
    </ChatNotificationContext.Provider>
  );
};
