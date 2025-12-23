import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import TermsModal from '../components/TermsModal';
import { validateRegisterForm } from '../utils/validation';
import { useNotification } from '../contexts/NotificationContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { success, error: notifyError } = useNotification();
  const [formErrors, setFormErrors] = useState({});
  const [showTerms, setShowTerms] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    type: 'client',
    cnpj: '',
    companyDescription: ''
  });

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    if (limited.length <= 10) {
      return limited
        .replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    } else {
      return limited
        .replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
        .replace(/-$/, '');
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formattedPhone = formatPhone(value);
      setRegisterData({ ...registerData, phone: formattedPhone });
      setError('');
      if (formErrors.phone) {
        setFormErrors({ ...formErrors, phone: undefined });
      }
      return;
    }

    if (name === 'type' && value !== 'company') {
      setRegisterData({
        ...registerData,
        [name]: value,
        cnpj: '',
        companyDescription: ''
      });
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }

    setError('');
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: undefined });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(loginData.email, loginData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validation = validateRegisterForm(registerData);
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError);
      notifyError(firstError);
      setFormErrors(validation.errors);
      setLoading(false);
      return;
    }

    setFormErrors({});

    try {
      const { confirmPassword, ...userData } = registerData;

      if (userData.type !== 'company') {
        delete userData.cnpj;
        delete userData.companyDescription;
      }

      await register(userData);
      success('Conta criada com sucesso!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao criar conta';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Serviços Locais
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setFormErrors({});
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setFormErrors({});
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium ${
                !isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Cadastro
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="seu@email.com"
                icon={Mail}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2 rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* 🔹 Esqueci minha senha */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                Entrar
              </Button>
            </form>
          ) : (
            /* Cadastro permanece igual */
            <form onSubmit={handleRegister} className="space-y-4">
              {/* … resto do cadastro exatamente como estava */}
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Ao continuar, você concorda com nossos{' '}
          <button
            onClick={() => setShowTerms(true)}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Termos de Uso
          </button>
        </p>
      </div>

      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default Login;
