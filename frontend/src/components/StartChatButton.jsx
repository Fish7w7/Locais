// frontend/src/components/StartChatButton.jsx
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import Button from './Button';

/**
 * Botão para iniciar conversa
 * 
 * @param {string} otherUserId
 * @param {string} type
 * @param {string} relatedId
 * @param {string} variant
 * @param {string} size
 * @param {boolean} fullWidth
 */
const StartChatButton = ({ 
  otherUserId, 
  type, 
  relatedId,
  variant = 'secondary',
  size = 'sm',
  fullWidth = false
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { error: showError } = useNotification();

  const handleStartChat = async () => {
    if (!otherUserId || !type || !relatedId) {
      showError('Não foi possível abrir o chat desta conversa.');
      return;
    }

    try {
      setLoading(true);
      
      // Criar ou obter conversa
      const res = await chatAPI.createOrGetConversation({
        otherUserId,
        type,
        relatedId
      });

      // Redirecionar para a página de chat
      navigate('/chat', { 
        state: { 
          selectedConversation: res.data.conversation 
        } 
      });
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
      showError(error.response?.data.message || 'Erro ao iniciar conversa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      icon={MessageCircle}
      onClick={handleStartChat}
      loading={loading}
      disabled={!otherUserId || !type || !relatedId}
    >
      Conversar
    </Button>
  );
};

export default StartChatButton;
