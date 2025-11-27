// frontend/src/components/ConfirmModal.jsx
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // danger, warning, info
  loading = false
}) => {
  const getIcon = () => {
    const icons = {
      danger: AlertTriangle,
      warning: AlertTriangle,
      info: Info,
      question: HelpCircle
    };
    return icons[variant] || Info;
  };

  const getIconColor = () => {
    const colors = {
      danger: 'text-red-600 dark:text-red-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
      question: 'text-gray-600 dark:text-gray-400'
    };
    return colors[variant] || colors.info;
  };

  const getIconBg = () => {
    const bgs = {
      danger: 'bg-red-100 dark:bg-red-900',
      warning: 'bg-yellow-100 dark:bg-yellow-900',
      info: 'bg-blue-100 dark:bg-blue-900',
      question: 'bg-gray-100 dark:bg-gray-700'
    };
    return bgs[variant] || bgs.info;
  };

  const Icon = getIcon();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center py-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${getIconBg()}`}>
          <Icon className={`w-8 h-8 ${getIconColor()}`} />
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

// Hook para usar confirmação
// frontend/src/hooks/useConfirm.js
import { useState } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  });

  const confirm = ({ title, message, onConfirm, variant = 'danger' }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        variant,
        onConfirm: async () => {
          const result = await onConfirm?.();
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(result);
        }
      });
    });
  };

  const cancel = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return { confirmState, confirm, cancel };
};

// Se quiser usar o hook e o modal juntos, veja o exemplo abaixo:
/*
import { useConfirm } from '../hooks/useConfirm';
import ConfirmModal from '../components/ConfirmModal';

const MyComponent = () => {
  const { confirmState, confirm, cancel } = useConfirm();

  const handleDelete = async () => {
    await confirm({
      title: 'Excluir item',
      message: 'Tem certeza que deseja excluir? Esta ação não pode ser desfeita.',
      variant: 'danger',
      onConfirm: async () => {
        await api.delete('/item/123');
      }
    });
  };

  return (
    <>
      <button onClick={handleDelete}>Excluir</button>
      
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={cancel}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
      />
    </>
  );
};
*/