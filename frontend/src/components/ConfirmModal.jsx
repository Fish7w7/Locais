import { AlertTriangle, HelpCircle, Info } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acao',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  loading = false
}) => {
  const icons = {
    danger: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
    question: HelpCircle
  };

  const iconColors = {
    danger: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
    question: 'text-gray-600 dark:text-gray-400'
  };

  const iconBgs = {
    danger: 'bg-red-100 dark:bg-red-900',
    warning: 'bg-yellow-100 dark:bg-yellow-900',
    info: 'bg-blue-100 dark:bg-blue-900',
    question: 'bg-gray-100 dark:bg-gray-700'
  };

  const Icon = icons[variant] || Info;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center py-4">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${iconBgs[variant] || iconBgs.info}`}>
          <Icon className={`w-8 h-8 ${iconColors[variant] || iconColors.info}`} />
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
