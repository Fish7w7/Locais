// frontend/src/pages/PublicProfile.jsx 
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, MapPin, Star, Briefcase, 
  DollarSign, Award, Calendar, MessageCircle, Send, Building2
} from 'lucide-react';
import { userAPI } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import ReviewsSection from '../components/ReviewsSection';
import CreateServiceModal from '../components/CreateServiceModal';
import CreateReviewModal from '../components/CreateReviewModal';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getUserById(userId);
      setProfileUser(response.data.user);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil do usuário');
    } finally {
      setLoading(false);
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

  const isOwnProfile = currentUser?.id === userId;

  // Redirecionar para perfil próprio se for o próprio usuário
  useEffect(() => {
    if (isOwnProfile && !loading) {
      navigate('/profile');
    }
  }, [isOwnProfile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Usuário não encontrado'}</p>
            <Button onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="container-mobile mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {profileUser.name}
          </h1>
        </div>
      </div>

      <div className="container-mobile mx-auto px-4 pt-6 space-y-4">
        {/* Profile Card */}
        <Card>
          <div className="flex flex-col items-center text-center mb-6">
            <img
              src={profileUser.avatar || `https://ui-avatars.com/api/?name=${profileUser.name}&size=200&background=random`}
              alt={profileUser.name}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {profileUser.name}
            </h2>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 mt-2">
              {getUserTypeLabel(profileUser.type)}
            </span>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profileUser.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>{profileUser.phone}</span>
            </div>
            {profileUser.city && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{profileUser.city}, {profileUser.state}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span>Membro desde {new Date(profileUser.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {profileUser.type === 'provider' && profileUser.isAvailableAsProvider && (
              <Button
                variant="primary"
                fullWidth
                icon={Send}
                onClick={() => setShowServiceModal(true)}
              >
                Solicitar Serviço
              </Button>
            )}
            <Button
              variant="secondary"
              fullWidth
              icon={MessageCircle}
              onClick={() => setShowReviewModal(true)}
            >
              Avaliar Usuário
            </Button>
          </div>
        </Card>

        {/* Provider Info */}
        {profileUser.type === 'provider' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informações Profissionais
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span>{profileUser.category}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span>R$ {profileUser.pricePerHour}/hora</span>
                </div>
              </div>

              {profileUser.description && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profileUser.description}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${profileUser.isAvailableAsProvider ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {profileUser.isAvailableAsProvider ? 'Disponível para serviços' : 'Indisponível no momento'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Company Info */}
        {profileUser.type === 'company' && profileUser.cnpj && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Informações da Empresa
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">CNPJ</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profileUser.cnpj}
                </p>
              </div>
              
              {profileUser.companyDescription && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sobre a empresa</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profileUser.companyDescription}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Ratings */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Avaliações
          </h3>
          
          <div className="space-y-3">
            {/* Ratings como Cliente */}
            {(profileUser.type === 'provider' || profileUser.type === 'client') && (
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
                        {profileUser.clientRating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({profileUser.clientReviewCount || 0} avaliações)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ratings como Prestador */}
            {profileUser.type === 'provider' && (
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
                        {profileUser.providerRating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({profileUser.providerReviewCount || 0} avaliações)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Reviews Section */}
        <ReviewsSection 
          userId={profileUser._id} 
          userType={profileUser.type}
        />
      </div>

      {/* Modals */}
      {profileUser.type === 'provider' && (
        <CreateServiceModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          provider={profileUser}
          onSuccess={() => {
            setShowServiceModal(false);
            alert('Solicitação enviada com sucesso!');
          }}
        />
      )}

      <CreateReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userId={profileUser._id}
        userType={profileUser.type === 'provider' ? 'provider' : 'client'}
        onSuccess={() => {
          setShowReviewModal(false);
          loadProfile();
        }}
      />
    </div>
  );
};

export default PublicProfile;