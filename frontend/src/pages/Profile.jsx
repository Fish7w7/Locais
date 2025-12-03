// frontend/src/pages/Profile.jsx 
import { useState } from 'react';
import { User, Mail, Phone, MapPin, Star, Briefcase, LogOut, Edit2, Save, DollarSign, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/services';
import { useNotification } from '../contexts/NotificationContext';
import { useLoading } from '../contexts/LoadingContext';
import { useConfirm } from '../hooks/useConfirm';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ConfirmModal from '../components/ConfirmModal';
import EditProviderInfoModal from '../components/EditProviderInfoModal';
import ReviewsSection from '../components/ReviewsSection';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { success, error: showError } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const { confirmState, confirm, cancel } = useConfirm();

  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [showEditProviderInfo, setShowEditProviderInfo] = useState(false);
  
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
      showError(error.response?.data?.message || 'Erro ao atualizar perfil');
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
      success('Parabéns! Agora você é um prestador de serviços!');
    } catch (error) {
      showError(error.response?.data?.message || 'Erro ao converter para prestador');
    } finally {
      hideLoading();
    }
  };

  const handleLogout = async () => {
    await confirm({
      title: 'Sair da Conta',
      message: 'Tem certeza que deseja sair?',
      variant: 'warning',
      onConfirm: () => {
        logout();
      }
    });
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
    // Recarregar dados do usuário se necessário
    try {
      const response = await userAPI.getProfile();
      updateUser(response.data.user);
    } catch (error) {
      console.error('Erro ao recarregar perfil:', error);
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Meu Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas informações pessoais
          </p>
        </div>
        
        {!isEditing && (
          <Button 
            icon={Edit2} 
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Editar
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&size=200&background=random`}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user?.name}
          </h2>
          <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 mt-2">
            {getUserTypeLabel(user?.type)}
          </span>
        </div>

        {/* Informações Básicas */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Mail className="w-5 h-5 text-gray-400" />
            <span>{user?.email}</span>
          </div>

          {isEditing ? (
            <>
              <Input
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                icon={User}
              />
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                icon={Phone}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Cidade"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
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
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{user?.phone || 'Não informado'}</span>
              </div>
              {(user?.city || user?.state) && (
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{user?.city}, {user?.state}</span>
                </div>
              )}
            </>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 mt-6">
            <Button 
              variant="primary" 
              fullWidth
              onClick={handleSave}
              icon={Save}
            >
              Salvar
            </Button>
            <Button 
              variant="secondary" 
              fullWidth
              onClick={handleCancelEdit}
            >
              Cancelar
            </Button>
          </div>
        )}
      </Card>

      {/* Avaliações */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Avaliações
        </h3>
        
        <div className="space-y-3">
          {/* Ratings Resumo */}
          {(user?.type === 'provider' || user?.type === 'client') && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Como Cliente
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {user?.clientRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({user?.clientReviewCount || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user?.type === 'provider' && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Como Prestador
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {user?.providerRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({user?.providerReviewCount || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Seção de Avaliações Completa */}
          <ReviewsSection 
            userId={user?.id} 
            userType={user?.type}
          />
        </div>
      </Card>

      {/* Informações de Prestador */}
      {user?.type === 'provider' && (
        <Card>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informações Profissionais
            </h3>
            <Button 
              size="sm"
              variant="ghost"
              onClick={() => setShowEditProviderInfo(true)}
            >
              Editar
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span>{user?.category}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span>R$ {user?.pricePerHour}/hora</span>
              </div>
            </div>

            {user?.description && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <div className={`w-2 h-2 rounded-full ${user?.isAvailableAsProvider ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.isAvailableAsProvider ? 'Disponível para serviços' : 'Indisponível no momento'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Tornar-se Prestador */}
      {user?.type === 'client' && !showUpgradeForm && (
        <Card>
          <div className="text-center py-4">
            <Briefcase className="w-12 h-12 text-primary-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Quer oferecer seus serviços?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Torne-se um prestador e comece a receber propostas de trabalho
            </p>
            <Button 
              variant="primary"
              onClick={() => setShowUpgradeForm(true)}
            >
              Tornar-me Prestador
            </Button>
          </div>
        </Card>
      )}

      {/* Formulário de Upgrade */}
      {showUpgradeForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações Profissionais
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <select
                name="category"
                value={upgradeData.category}
                onChange={handleUpgradeChange}
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição dos Serviços
              </label>
              <textarea
                name="description"
                value={upgradeData.description}
                onChange={handleUpgradeChange}
                rows={4}
                placeholder="Descreva sua experiência e os serviços que você oferece..."
                className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="primary" 
                fullWidth
                onClick={handleUpgradeToProvider}
              >
                Confirmar
              </Button>
              <Button 
                variant="secondary" 
                fullWidth
                onClick={() => setShowUpgradeForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Logout */}
      <Card>
        <Button 
          variant="danger" 
          fullWidth
          icon={LogOut}
          onClick={handleLogout}
        >
          Sair da Conta
        </Button>
      </Card>

      {/* Modals */}
      <EditProviderInfoModal
        isOpen={showEditProviderInfo}
        onClose={() => setShowEditProviderInfo(false)}
        user={user}
        onSuccess={loadUserData}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={cancel}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
      />
    </div>
  );
};

export default Profile;