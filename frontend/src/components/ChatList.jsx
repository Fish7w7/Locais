// frontend/src/components/ChatList.jsx
import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { useChatNotifications } from '../contexts/ChatNotificationContext';
import Card from './Card';
import Input from './Input';

const getLastMessage = (conversation) =>
  conversation.lastMessage || {
    content: 'Conversa iniciada',
    timestamp: conversation.updatedAt || conversation.createdAt
  };

const getConversationTime = (conversation) => {
  const timestamp = getLastMessage(conversation).timestamp || conversation.updatedAt || conversation.createdAt;
  const date = timestamp ? new Date(timestamp) : null;
  return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
};

const getConversationType = (type) => {
  const types = {
    service: 'Serviço',
    job_application: 'Candidatura',
    job_proposal: 'Proposta'
  };
  return types[type] || type;
};

const ChatList = ({ onSelectConversation }) => {
  const { conversations, syncFromConversations, loadConversations } = useChatNotifications();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      await loadConversations();
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return conversations
      .filter((conversation) => {
        const otherUserName = conversation.otherUser?.name || '';
        const typeLabel = getConversationType(conversation.type);
        const lastMessage = getLastMessage(conversation).content || '';
        const searchableText = `${otherUserName} ${typeLabel} ${lastMessage}`.toLowerCase();

        return !normalizedSearch || searchableText.includes(normalizedSearch);
      })
      .sort((a, b) => getConversationTime(b) - getConversationTime(a));
  }, [conversations, searchTerm]);

  const handleSelectConversation = (conversation) => {
    const updatedConversations = conversations.map((item) =>
      item._id === conversation._id ? { ...item, unreadCount: 0 } : item
    );

    syncFromConversations(updatedConversations);
    onSelectConversation({ ...conversation, unreadCount: 0 });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Buscar conversas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={Search}
      />

      {filteredConversations.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-semibold text-gray-900 dark:text-white">
              {searchTerm.trim() ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {searchTerm.trim()
                ? 'Tente buscar por nome, tipo de conversa ou última mensagem.'
                : 'Quando uma solicitação ou candidatura permitir conversa, ela aparecerá aqui.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => {
            const otherUser = conversation.otherUser || {};
            const otherUserName = otherUser.name || 'Usuário removido';
            const avatarUrl =
              otherUser.avatar ||
              `https://ui-avatars.com/api/name=${encodeURIComponent(otherUserName)}&background=random`;
            const lastMessage = getLastMessage(conversation);

            return (
              <Card
                key={conversation._id}
                onClick={() => handleSelectConversation(conversation)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSelectConversation(conversation);
                  }
                }}
                role="button"
                tabIndex={0}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={otherUserName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherUserName}
                      </h3>
                      {lastMessage.timestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {getConversationType(conversation.type)}
                    </p>

                    {lastMessage.content ? (
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0
                          ? 'font-semibold text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        Conversa iniciada
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
