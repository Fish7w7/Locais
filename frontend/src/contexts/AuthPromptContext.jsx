import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from './AuthContext';
import Modal from '../components/Modal';
import Button from '../components/Button';

const AuthPromptContext = createContext();

export const useAuthPrompt = () => {
  const context = useContext(AuthPromptContext);
  if (!context) {
    throw new Error('useAuthPrompt deve ser usado dentro de AuthPromptProvider');
  }
  return context;
};

const defaultPrompt = {
  title: 'Entre para continuar',
  message: 'Para solicitar serviços, se candidatar a vagas ou conversar com prestadores, você precisa entrar ou criar uma conta.',
  suggestedType: 'client',
  returnTo: '/',
  returnState: null
};

const suggestedTypeLabels = {
  client: 'Cliente',
  provider: 'Prestador',
  company: 'Empresa'
};

export const AuthPromptProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState(null);

  const requireAuth = useCallback((options = {}) => {
    if (isAuthenticated) return true;

    setPrompt({
      ...defaultPrompt,
      ...options,
      returnTo: options.returnTo || location.pathname,
      returnState: options.returnState || location.state || null
    });

    return false;
  }, [isAuthenticated, location.pathname, location.state]);

  const closePrompt = useCallback(() => {
    setPrompt(null);
  }, []);

  const goToAuth = useCallback((mode) => {
    const currentPrompt = prompt || defaultPrompt;
    setPrompt(null);
    navigate('/login', {
      state: {
        authMode: mode,
        suggestedType: currentPrompt.suggestedType,
        returnTo: currentPrompt.returnTo,
        returnState: currentPrompt.returnState
      }
    });
  }, [navigate, prompt]);

  const value = useMemo(() => ({
    requireAuth,
    closePrompt
  }), [closePrompt, requireAuth]);

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <Modal
        isOpen={!!prompt}
        onClose={closePrompt}
        title={prompt?.title || defaultPrompt.title}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {prompt?.message || defaultPrompt.message}
          </p>

          {prompt?.suggestedType && (
            <div className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800 dark:bg-primary-900/30 dark:text-primary-100">
              Conta sugerida: <strong>{suggestedTypeLabels[prompt.suggestedType] || 'Cliente'}</strong>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button icon={LogIn} onClick={() => goToAuth('login')} fullWidth>
              Entrar
            </Button>
            <Button icon={UserPlus} variant="secondary" onClick={() => goToAuth('register')} fullWidth>
              Cadastrar
            </Button>
          </div>
        </div>
      </Modal>
    </AuthPromptContext.Provider>
  );
};
