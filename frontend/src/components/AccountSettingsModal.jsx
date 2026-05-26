import { useEffect, useState } from 'react';
import { AlertTriangle, Lock, Trash2, UserX } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const AccountSettingsModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { success } = useNotification();
  const [activeTab, setActiveTab] = useState('deactivate');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [deactivateConfirmation, setDeactivateConfirmation] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setError('');
    setPassword('');
    setDeactivateConfirmation('');
    setConfirmation('');
  };

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const handleDeactivate = async (e) => {
    e.preventDefault();
    setError('');

    if (deactivateConfirmation !== 'DESATIVAR') {
      setError('Digite exatamente: DESATIVAR');
      return;
    }

    setLoading(true);

    try {
      await api.put('/users/deactivate', { password });
      success('Conta desativada. Seu perfil não ficará visível publicamente enquanto ela estiver desativada.');
      logout();
      onClose();
    } catch (err) {
      setError(err.response?.data.message || 'Erro ao desativar conta');
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

    try {
      await api.delete('/users/delete-account', {
        data: { password, confirmation }
      });
      success('Conta excluída. Seus dados pessoais foram anonimizados.');
      logout();
      onClose();
    } catch (err) {
      setError(err.response?.data.message || 'Erro ao deletar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Conta" size="lg">
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab('deactivate');
              resetForm();
            }}
            className={`min-h-[44px] border-b-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'deactivate'
                ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Desativar
          </button>
          <button
            onClick={() => {
              setActiveTab('delete');
              resetForm();
            }}
            className={`min-h-[44px] border-b-2 px-4 py-2 font-medium transition-colors ${
              activeTab === 'delete'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Excluir
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {activeTab === 'deactivate' && (
          <form onSubmit={handleDeactivate} className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex gap-3">
                <UserX className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="mb-2 font-medium">Desativação temporária</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Seu perfil público deixa de aparecer para outros usuários</li>
                    <li>Prestadores somem das buscas e empresas deixam de exibir vagas publicamente</li>
                    <li>Seu histórico e dados da conta são preservados</li>
                    <li>A conta é reativada automaticamente no próximo login</li>
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Digite <span className="font-mono text-yellow-700 dark:text-yellow-300">DESATIVAR</span>
              </label>
              <input
                type="text"
                value={deactivateConfirmation}
                onChange={(e) => setDeactivateConfirmation(e.target.value)}
                placeholder="DESATIVAR"
                required
                className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-yellow-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                variant="warning"
                fullWidth
                loading={loading}
                disabled={deactivateConfirmation !== 'DESATIVAR'}
              >
                Desativar Conta
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading} fullWidth>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {activeTab === 'delete' && (
          <form onSubmit={handleDelete} className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="mb-2 font-medium">Exclusão permanente</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>Dados pessoais como nome, foto, perfil e contato serão anonimizados</li>
                    <li>Seu perfil, suas vagas e seus serviços deixam de aparecer publicamente</li>
                    <li>Histórico de chats e registros mínimos podem ser preservados para segurança e moderação</li>
                    <li>Esta ação não pode ser desfeita</li>
                    <li>Você perderá acesso à conta para sempre</li>
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Digite <span className="font-mono text-red-600">DELETAR PERMANENTEMENTE</span>
              </label>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="DELETAR PERMANENTEMENTE"
                required
                className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                variant="danger"
                fullWidth
                loading={loading}
                icon={Trash2}
                disabled={confirmation !== 'DELETAR PERMANENTEMENTE'}
              >
                Deletar Permanentemente
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} disabled={loading} fullWidth>
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
