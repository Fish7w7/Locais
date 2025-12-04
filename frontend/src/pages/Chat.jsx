// frontend/src/pages/Chat.jsx
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);

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
              Suas conversas com prestadores, clientes e empresas
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
          />
        </div>
      )}
    </div>
  );
};

export default Chat;