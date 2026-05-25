// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building, DollarSign } from 'lucide-react';
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

  const [loginData, setLoginData] = useState({ email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({ name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    type: 'client',
    cnpj: '',
    companyDescription: '',
    category: '',
    pricePerHour: '',
    description: '',
    isAvailableAsProvider: true
  });

  const providerCategories = [
    'Eletricista',
    'Encanador',
    'Pintor',
    'Pedreiro',
    'Carpinteiro',
    'Jardineiro',
    'Faxineiro',
    'Técnico em TI',
    'Mecânico',
    'Outro'
  ];

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

    if (name === 'type') {
      setRegisterData({
        ...registerData,
        [name]: value,
        cnpj: value === 'company' ? registerData.cnpj : '',
        companyDescription: value === 'company' ? registerData.companyDescription : '',
        category: value === 'provider' ? registerData.category : '',
        pricePerHour: value === 'provider' ? registerData.pricePerHour : '',
        description: value === 'provider' ? registerData.description : '',
        isAvailableAsProvider: value === 'provider'
      });
    } else if (name === 'isAvailableAsProvider') {
      setRegisterData({ ...registerData, [name]: e.target.checked });
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
      setError(err.response?.data.message || 'Erro ao fazer login');
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

      if (userData.type !== 'provider') {
        delete userData.category;
        delete userData.pricePerHour;
        delete userData.description;
        delete userData.isAvailableAsProvider;
      } else {
        userData.pricePerHour = Number(userData.pricePerHour);
      }

      await register(userData);
      success('Conta criada com sucesso!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data.message || 'Erro ao criar conta';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setFormErrors({});
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                isLogin ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
                !isLogin ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

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
            /* Cadastro */
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Conta
                </label>
                <select
                  name="type"
                  value={registerData.type}
                  onChange={handleRegisterChange}
                  className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                >
                  <option value="client">Cliente</option>
                  <option value="provider">Prestador de Serviços</option>
                  <option value="company">Empresa</option>
                </select>
              </div>

              {registerData.type === 'provider' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoria
                    </label>
                    <select
                      name="category"
                      value={registerData.category}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {providerCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.category}</p>
                    )}
                  </div>

                  <Input
                    label="Preço por Hora"
                    type="number"
                    name="pricePerHour"
                    value={registerData.pricePerHour}
                    onChange={handleRegisterChange}
                    placeholder="Ex: 80"
                    icon={DollarSign}
                    error={formErrors.pricePerHour}
                    min="1"
                    step="0.01"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descrição dos Serviços
                    </label>
                    <textarea
                      name="description"
                      value={registerData.description}
                      onChange={handleRegisterChange}
                      rows={4}
                      placeholder="Conte sua experiência e quais serviços você oferece..."
                      className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                      required
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                    )}
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-3">
                    <input
                      type="checkbox"
                      name="isAvailableAsProvider"
                      checked={registerData.isAvailableAsProvider}
                      onChange={handleRegisterChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrar meu perfil na busca de prestadores assim que a conta for criada.
                    </span>
                  </label>
                </>
              )}

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
                      placeholder="Descreva sua empresa..."
                      className="w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                placeholder="Mínimo 6 caracteres"
                icon={Lock}
                error={formErrors.password}
                required
              />

              <Input
                label="Confirmar Senha"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                placeholder="Digite novamente"
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
