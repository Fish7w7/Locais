// frontend/src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../api/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      
      // Em desenvolvimento, mostrar o link
      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Enviado!
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
            </p>

            {resetUrl && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  🔧 Modo Desenvolvimento - Link de Reset:
                </p>
                <a 
                  href={resetUrl}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {resetUrl}
                </a>
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate('/login')}
              >
                Voltar para Login
              </Button>
              <button
                onClick={() => setSuccess(false)}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600"
              >
                Enviar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Login
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
              <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Esqueci Minha Senha
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Digite seu email para receber instruções de redefinição
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              icon={Mail}
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              icon={Send}
            >
              Enviar Instruções
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;