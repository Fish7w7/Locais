// frontend/src/pages/Chat.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useChatNotifications } from '../contexts/ChatNotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthPrompt } from '../contexts/AuthPromptContext';
import { chatAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthPrompt();
  const { error: showError } = useNotification();
  const [selectedConversation, setSelectedConversation] = useState(
    location.state?.selectedConversation || null
  );
  const [openingPendingChat, setOpeningPendingChat] = useState(false);
  const { totalUnread, refreshUnreadCount } = useChatNotifications();

  useEffect(() => {
    if (location.state?.selectedConversation) {
      setSelectedConversation(location.state.selectedConversation);
    }
  }, [location.state?.selectedConversation]);

  useEffect(() => {
    const pendingChat = location.state?.pendingChat;

    if (!isAuthenticated || !pendingChat || openingPendingChat) {
      return;
    }

    const openPendingChat = async () => {
      try {
        setOpeningPendingChat(true);
        const response = await chatAPI.createOrGetConversation(pendingChat);
        setSelectedConversation(response.data.conversation);
        navigate('/chat', {
          replace: true,
          state: { selectedConversation: response.data.conversation }
        });
      } catch (error) {
        console.error('Erro ao abrir conversa pendente:', error);
        showError(error.response?.data.message || 'Erro ao abrir conversa');
        navigate('/chat', { replace: true });
      } finally {
        setOpeningPendingChat(false);
      }
    };

    openPendingChat();
  }, [isAuthenticated, location.state?.pendingChat, navigate, openingPendingChat, showError]);

  if (!isAuthenticated) {
    return (
      <Card>
        <div className="py-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Entre para acessar suas mensagens
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600 dark:text-gray-400">
            Crie uma conta ou faça login para conversar com prestadores, clientes e empresas.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              onClick={() => requireAuth({ suggestedType: 'client', returnTo: '/chat' })}
              fullWidth
            >
              Entrar
            </Button>
            <Button
              variant="secondary"
              onClick={() => requireAuth({ suggestedType: 'client', returnTo: '/chat' })}
              fullWidth
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

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
              {openingPendingChat
                ? 'Abrindo conversa...'
                : totalUnread > 0
                ? `${totalUnread} ${totalUnread === 1 ? 'mensagem nova' : 'mensagens novas'} para acompanhar`
                : 'Suas conversas com prestadores, clientes e empresas'}
            </p>
          </div>

          {/* Conversations List */}
          {openingPendingChat ? (
            <Card>
              <div className="py-10 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  Preparando sua conversa...
                </p>
              </div>
            </Card>
          ) : (
            <ChatList onSelectConversation={setSelectedConversation} />
          )}
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
