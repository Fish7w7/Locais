// frontend/src/components/ChatList.jsx
import { useState, useEffect } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { chatAPI } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import Card from './Card';
import Input from './Input';

const ChatList = ({ onSelectConversation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getMyConversations();
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversationType = (type) => {
    const types = {
      service: 'Serviço',
      job_application: 'Candidatura',
      job_proposal: 'Proposta'
    };
    return types[type] || type;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Agora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
      {/* Search */}
      <Input
        placeholder="Buscar conversas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={Search}
      />

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma conversa ainda
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Card
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={conversation.otherUser?.avatar || `https://ui-avatars.com/api/?name=${conversation.otherUser?.name}&background=random`}
                    alt={conversation.otherUser?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {conversation.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conversation.otherUser?.name}
                    </h3>
                    {conversation.lastMessage?.timestamp && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {getConversationType(conversation.type)}
                  </p>

                  {conversation.lastMessage?.content && (
                    <p className={`text-sm truncate ${
                      conversation.unreadCount > 0
                        ? 'font-semibold text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;