// frontend/src/components/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { chatAPI } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const ChatWindow = ({ conversation, onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadMessages();
    inputRef.current?.focus();
  }, [conversation._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getMessages(conversation._id);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const res = await chatAPI.sendMessage(conversation._id, {
        content: messageContent
      });

      setMessages(prev => [...prev, res.data.message]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert(error.response?.data?.message || 'Erro ao enviar mensagem');
      setNewMessage(messageContent); // Restaura mensagem
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <img
          src={conversation.otherUser?.avatar || `https://ui-avatars.com/api/?name=${conversation.otherUser?.name}&background=random`}
          alt={conversation.otherUser?.name}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {conversation.otherUser?.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {conversation.otherUser?.type === 'provider' && 'Prestador'}
            {conversation.otherUser?.type === 'client' && 'Cliente'}
            {conversation.otherUser?.type === 'company' && 'Empresa'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma mensagem ainda. Inicie a conversa!
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = message.sender._id === user.id;
            const isSystem = message.messageType === 'system';

            if (isSystem) {
              return (
                <div key={message._id} className="flex justify-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {message.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={message._id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[75%] ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && (
                    <img
                      src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.name}&background=random`}
                      alt={message.sender.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}

                  <div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                    </div>
                    <span className={`text-xs text-gray-500 dark:text-gray-400 mt-1 block ${isMe ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={sending}
            maxLength={1000}
            className="flex-1 px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 disabled:opacity-50 min-h-[44px]"
          />
          <Button
            type="submit"
            icon={Send}
            disabled={!newMessage.trim() || sending}
            loading={sending}
            className="min-h-[44px]"
          >
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;