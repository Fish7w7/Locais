import { Wrench, RefreshCw, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const Maintenance = ({ onRetry }) => {
  const [countdown, setCountdown] = useState(60);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRetry();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (onRetry) {
      await onRetry();
    }
    setTimeout(() => setIsRetrying(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-orange-100 dark:bg-orange-900 rounded-full mb-6 animate-pulse">
            <Wrench className="w-12 h-12 text-orange-600 dark:text-orange-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Sistema em Manutenção
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Estamos realizando melhorias no sistema. 
            Voltaremos em breve!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            {/* Countdown */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Próxima verificação em
                </span>
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {countdown}s
              </span>
            </div>

            {/* Retry Button */}
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Verificando...' : 'Tentar Novamente'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Se o problema persistir, entre em contato:</p>
          <a 
            href="mailto:suporte@servicoslocais.com" 
            className="text-orange-600 dark:text-orange-400 hover:underline"
          >
            suporte@servicoslocais.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;