import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Briefcase,
  DollarSign,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings as SettingsIcon,
  Star,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, userAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import EditProviderInfoModal from '../components/EditProviderInfoModal';
import ReviewsSection from '../components/ReviewsSection';
import TermsModal from '../components/TermsModal';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const categories = [
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

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useNotification();
  const { showLoading, hideLoading } = useLoading();

  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [showEditProviderInfo, setShowEditProviderInfo] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || ''
  });
  const [upgradeData, setUpgradeData] = useState({
    category: '',
    pricePerHour: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpgradeChange = (e) => {
    setUpgradeData({
      ...upgradeData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      showLoading('Salvando perfil...');
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.user);
      setIsEditing(false);
      success('Perfil atualizado com sucesso!');
    } catch (error) {
      showError(error.response?.data.message || 'Erro ao atualizar perfil');
    } finally {
      hideLoading();
    }
  };

  const handleUpgradeToProvider = async () => {
    try {
      showLoading('Convertendo para prestador...');
      const response = await userAPI.upgradeToProvider(upgradeData);
      updateUser(response.data.user);
      setShowUpgradeForm(false);
      success('Parabéns! Agora você é um prestador de serviços.');
    } catch (error) {
      showError(error.response?.data.message || 'Erro ao converter para prestador');
    } finally {
      hideLoading();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || ''
    });
  };

  const loadUserData = async () => {
    try {
      const response = await authAPI.getMe();
      updateUser(response.data.user);
    } catch (error) {
      console.error('Erro ao recarregar perfil:', error);
      showError('Erro ao recarregar perfil');
    }
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      client: 'Cliente',
      provider: 'Prestador de Serviços',
      company: 'Empresa',
      admin: 'Administrador'
    };
    return labels[type] || type;
  };

  const formatRating = (value) => Number(value || 0).toFixed(1);

  if (!user) {
    return (
      <div className="space-y-4">
        <Card>
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
              <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Entre para acessar seu perfil
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600 dark:text-gray-400">
              Crie uma conta ou faça login para gerenciar seus dados, acompanhar solicitações, candidaturas e mensagens.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                onClick={() => navigate('/login', {
                  state: { authMode: 'login', suggestedType: 'client', returnTo: '/profile' }
                })}
                fullWidth
              >
                Entrar
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/login', {
                  state: { authMode: 'register', suggestedType: 'client', returnTo: '/profile' }
                })}
                fullWidth
              >
                Cadastrar
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Preferências públicas
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Visitantes podem acessar informações legais e preferências que não dependem de conta.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={() => navigate('/settings')} fullWidth>
              Abrir Configurações
            </Button>
            <Button variant="secondary" onClick={() => setShowTerms(true)} fullWidth>
              Termos de Uso
            </Button>
            <Button variant="secondary" onClick={() => setShowPrivacy(true)} fullWidth>
              Política de Privacidade
            </Button>
          </div>
        </Card>

        <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Meu Perfil
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gerencie suas informações pessoais
          </p>
        </div>

        {!isEditing && (
          <Button icon={Edit2} size="sm" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </div>

      <Card>
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src={user.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(user.name)}&size=200&background=random`}
            alt={user.name}
            className="mb-4 h-24 w-24 rounded-full object-cover"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h2>
          <span className="mt-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
            {getUserTypeLabel(user.type)}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Mail className="h-5 w-5 text-gray-400" />
            <span>{user.email}</span>
          </div>

          {isEditing ? (
            <>
              <Input label="Nome" name="name" value={formData.name} onChange={handleChange} icon={User} />
              <Input label="Telefone" name="phone" value={formData.phone} onChange={handleChange} icon={Phone} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} />
                <Input
                  label="Estado"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Ex: RJ"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{user.phone || 'Não informado'}</span>
              </div>
              {(user.city || user.state) && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>{[user.city, user.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </>
          )}
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-2">
            <Button variant="primary" fullWidth onClick={handleSave} icon={Save}>
              Salvar
            </Button>
            <Button variant="secondary" fullWidth onClick={handleCancelEdit}>
              Cancelar
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Avaliações
        </h3>

        <div className="space-y-3">
          {(user.type === 'provider' || user.type === 'client') && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900">
                  <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Como Cliente
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatRating(user.clientRating)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({user.clientReviewCount || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.type === 'provider' && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                  <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Como Prestador
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatRating(user.providerRating)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({user.providerReviewCount || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ReviewsSection userId={user.id} userType={user.type} />
        </div>
      </Card>

      {user.type === 'provider' && (
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informações Profissionais
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setShowEditProviderInfo(true)}>
              Editar
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Briefcase className="h-5 w-5 text-gray-400" />
              <span>{user.category || 'Categoria não informada'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <span>R$ {user.pricePerHour || 0}/hora</span>
            </div>

            {user.description && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.description}
                </p>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${user.isAvailableAsProvider ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user.isAvailableAsProvider ? 'Disponível para serviços' : 'Indisponível no momento'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {user.type === 'client' && !showUpgradeForm && (
        <Card>
          <div className="py-4 text-center">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-primary-600" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Quer oferecer seus serviços?
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Torne-se um prestador e comece a receber propostas de trabalho.
            </p>
            <Button variant="primary" onClick={() => setShowUpgradeForm(true)}>
              Tornar-me Prestador
            </Button>
          </div>
        </Card>
      )}

      {showUpgradeForm && (
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Informações Profissionais
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoria
              </label>
              <select
                name="category"
                value={upgradeData.category}
                onChange={handleUpgradeChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Input
              label="Preço por Hora"
              type="number"
              name="pricePerHour"
              value={upgradeData.pricePerHour}
              onChange={handleUpgradeChange}
              placeholder="Ex: 50"
              icon={DollarSign}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descrição dos Serviços
              </label>
              <textarea
                name="description"
                value={upgradeData.description}
                onChange={handleUpgradeChange}
                rows={4}
                placeholder="Descreva sua experiência e os serviços que você oferece..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="primary" fullWidth onClick={handleUpgradeToProvider}>
                Confirmar
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setShowUpgradeForm(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Button
          variant="secondary"
          fullWidth
          icon={SettingsIcon}
          onClick={() => navigate('/settings')}
        >
          Configurações de Conta
        </Button>
      </Card>

      <EditProviderInfoModal
        isOpen={showEditProviderInfo}
        onClose={() => setShowEditProviderInfo(false)}
        user={user}
        onSuccess={loadUserData}
      />
    </div>
  );
};

export default Profile;
