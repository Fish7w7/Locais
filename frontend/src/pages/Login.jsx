import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      return limited.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    } else {
      return limited.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
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
        {/* Logo/Header */}
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
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
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
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                !isLogin
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Cadastro
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
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
                    className="w-full pl-10 pr-10 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                Entrar
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Nome Completo"
                type="text"
                name="name"
                value={registerData.name}
                onChange={handleRegisterChange}
                placeholder="João Silva"
                icon={User}
                error={formErrors.name} 
                required
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                placeholder="seu@email.com"
                icon={Mail}
                error={formErrors.email} 
                required
              />

              <Input
                label="Telefone"
                type="tel"
                name="phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                placeholder="(21) 99999-9999"
                icon={Phone}
                error={formErrors.phone} 
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Conta
                </label>
                <select
                  name="type"
                  value={registerData.type}
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="client">Cliente</option>
                  <option value="provider">Prestador de Serviços</option>
                  <option value="company">Empresa</option>
                </select>
              </div>

              {registerData.type === 'company' && (
                <>
                  <Input
                    label="CNPJ"
                    type="text"
                    name="cnpj"
                    value={registerData.cnpj}
                    onChange={handleRegisterChange}
                    placeholder="00.000.000/0000-00"
                    icon={Building}
                    error={formErrors.cnpj} 
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição da Empresa
                    </label>
                    <textarea
                      name="companyDescription"
                      value={registerData.companyDescription}
                      onChange={handleRegisterChange}
                      rows={3}
                      placeholder="Conte sobre sua empresa..."
                      className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        formErrors.companyDescription 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                      } focus:ring-2`}
                    />
                    {formErrors.companyDescription && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.companyDescription}</p>
                    )}
                  </div>
                </>
              )}

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
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className={`w-full pl-10 pr-10 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      formErrors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
                    } focus:ring-2`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>

              <Input
                label="Confirmar Senha"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="Digite a senha novamente"
                icon={Lock}
                error={formErrors.confirmPassword} 
                required
              />

              <Button type="submit" fullWidth loading={loading}>
                Criar Conta
              </Button>
            </form>
          )}
        </div>

        {/* Footer com Termos de Uso */}
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

      {/* Modal de Termos de Uso */}
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};

export default Login;