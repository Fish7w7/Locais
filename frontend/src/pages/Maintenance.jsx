// frontend/src/pages/Maintenance.jsx
import { Wrench, RefreshCw, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const Maintenance = ({ onRetry }) => {
  const [countdown, setCountdown] = useState(30);
  const [isRetrying, setIsRetrying] = useState(false);
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);

  useEffect(() => {
    if (!autoRetryEnabled) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRetryEnabled]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
    } catch (error) {
      console.error('Erro ao verificar manutenção:', error);
    } finally {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animação */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full mb-6 animate-bounce shadow-2xl">
            <Wrench className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Sistema em Manutenção
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Estamos realizando melhorias no sistema.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Voltaremos em breve!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Manutenção em andamento
              </span>
            </div>

            {/* Auto-retry toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Verificação automática
                </span>
              </div>
              <button
                onClick={() => setAutoRetryEnabled(!autoRetryEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRetryEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRetryEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Countdown */}
            {autoRetryEnabled && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Próxima verificação em
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {countdown}s
                </span>
              </div>
            )}

            {/* Manual Retry */}
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Verificando...' : 'Verificar Agora'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Processando atualizações
            </span>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Se o problema persistir, entre em contato:
          </p>
          <a 
            href="mailto:suporte@servicoslocais.com" 
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
          >
            suporte@servicoslocais.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;