// frontend/src/components/AccountSettingsModal.jsx
import { useState } from 'react';
import { AlertTriangle, UserX, Trash2, Lock } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const AccountSettingsModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('deactivate');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleDeactivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put('/users/deactivate', { password });
      alert('✅ Conta desativada com sucesso! Você pode reativá-la fazendo login novamente.');
      logout();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao desativar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (confirmation !== 'DELETAR PERMANENTEMENTE') {
      setError('Digite exatamente: DELETAR PERMANENTEMENTE');
      setLoading(false);
      return;
    }

    if (!window.confirm('⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL! Todos os seus dados serão perdidos permanentemente. Deseja continuar?')) {
      setLoading(false);
      return;
    }

    try {
      await api.delete('/users/delete-account', { 
        data: { password, confirmation } 
      });
      alert('✅ Conta deletada permanentemente.');
      logout();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao deletar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações de Conta" size="lg">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab('deactivate');
              setError('');
              setPassword('');
              setConfirmation('');
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 min-h-[44px] ${
              activeTab === 'deactivate'
                ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Desativar Conta
          </button>
          <button
            onClick={() => {
              setActiveTab('delete');
              setError('');
              setPassword('');
              setConfirmation('');
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 min-h-[44px] ${
              activeTab === 'delete'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Deletar Permanentemente
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Desativar Conta */}
        {activeTab === 'deactivate' && (
          <form onSubmit={handleDeactivate} className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <UserX className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium mb-2">O que acontece ao desativar?</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Seu perfil ficará invisível para outros usuários</li>
                    <li>Você não receberá novas solicitações</li>
                    <li>Seus dados serão preservados</li>
                    <li>Você pode reativar a qualquer momento fazendo login</li>
                  </ul>
                </div>
              </div>
            </div>

            <Input
              label="Confirme sua senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              icon={Lock}
              required
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="warning"
                fullWidth
                loading={loading}
              >
                Desativar Conta
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                fullWidth
                className="sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {/* Deletar Permanentemente */}
        {activeTab === 'delete' && (
          <form onSubmit={handleDelete} className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-2">⚠️ ATENÇÃO: Ação Irreversível!</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Todos os seus dados serão deletados PERMANENTEMENTE</li>
                    <li>Suas avaliações, serviços e mensagens serão removidos</li>
                    <li>Esta ação NÃO PODE ser desfeita</li>
                    <li>Você perderá acesso à sua conta para sempre</li>
                  </ul>
                </div>
              </div>
            </div>

            <Input
              label="Confirme sua senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              icon={Lock}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Digite: <span className="font-mono text-red-600">DELETAR PERMANENTEMENTE</span>
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="DELETAR PERMANENTEMENTE"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 min-h-[44px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="danger"
                fullWidth
                loading={loading}
                icon={Trash2}
              >
                Deletar Permanentemente
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                fullWidth
                className="sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default AccountSettingsModal;