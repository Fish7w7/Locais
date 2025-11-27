// frontend/src/hooks/useConfirm.js
import { useState } from 'react';

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    onConfirm: () => {}
  });

  /**
   * Abre modal de confirmação
   * @param {Object} config 
   * @param {string} config.title 
   * @param {string} config.message 
   * @param {string} config.variant 
   * @param {Function} config.onConfirm 
   */
  const confirm = ({ title, message, variant = 'info', onConfirm }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        variant,
        onConfirm: async () => {
          try {
            await onConfirm();
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            resolve(true);
          } catch (error) {
            console.error('Erro no onConfirm:', error);
            setConfirmState(prev => ({ ...prev, isOpen: false }));
            resolve(false);
          }
        }
      });
    });
  };

  const cancel = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  return { confirmState, confirm, cancel };
};

export default useConfirm;