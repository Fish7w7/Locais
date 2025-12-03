import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // LARGURAS RESPONSIVAS - CORRETO PARA MOBILE E DESKTOP
  const sizeClasses = {
    // Mobile: quase tela cheia | Desktop: largura fixa
    sm: 'w-[calc(100vw-2rem)] sm:w-full sm:max-w-sm',      // Mobile: ~full | Desktop: 384px
    md: 'w-[calc(100vw-2rem)] sm:w-full sm:max-w-md',      // Mobile: ~full | Desktop: 448px
    lg: 'w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg',      // Mobile: ~full | Desktop: 512px
    xl: 'w-[calc(100vw-2rem)] sm:w-full sm:max-w-xl',      // Mobile: ~full | Desktop: 576px
    '2xl': 'w-[calc(100vw-2rem)] sm:w-full sm:max-w-2xl',  // Mobile: ~full | Desktop: 672px
    full: 'w-[calc(100vw-2rem)] sm:w-full sm:max-w-4xl'    // Mobile: ~full | Desktop: 896px
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative 
            bg-white dark:bg-gray-800 
            rounded-lg 
            shadow-xl 
            transform 
            transition-all
            ${sizeClasses[size]}
            max-h-[90vh]
            flex
            flex-col
          `}
        >
          {/* Header - FIXO NO TOPO */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate pr-2">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content - SCROLLABLE */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;