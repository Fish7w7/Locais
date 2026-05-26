// frontend/src/pages/Chat.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useChatNotifications } from '../contexts/ChatNotificationContext';

const Chat = () => {
  const location = useLocation();
  const [selectedConversation, setSelectedConversation] = useState(
    location.state?.selectedConversation || null
  );
  const { totalUnread, refreshUnreadCount } = useChatNotifications();

  useEffect(() => {
    if (location.state?.selectedConversation) {
      setSelectedConversation(location.state.selectedConversation);
    }
  }, [location.state?.selectedConversation]);

  return (
    <div className="space-y-4">
      {!selectedConversation ? (
        <>
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mensagens
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {totalUnread > 0
                ? `${totalUnread} ${totalUnread === 1 ? 'mensagem nova' : 'mensagens novas'} para acompanhar`
                : 'Suas conversas com prestadores, clientes e empresas'}
            </p>
          </div>

          {/* Conversations List */}
          <ChatList onSelectConversation={setSelectedConversation} />
        </>
      ) : (
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900">
          <ChatWindow
            conversation={selectedConversation}
            onBack={() => setSelectedConversation(null)}
            onMessagesRead={refreshUnreadCount}
          />
        </div>
      )}
    </div>
  );
};

export default Chat;
