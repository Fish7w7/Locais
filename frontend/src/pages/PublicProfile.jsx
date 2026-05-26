import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Star
} from 'lucide-react';
import { userAPI } from '../api/services';
import { useAuth } from '../contexts/AuthContext';
import { useAuthPrompt } from '../contexts/AuthPromptContext';
import Card from '../components/Card';
import Button from '../components/Button';
import ReviewsSection from '../components/ReviewsSection';
import CreateServiceModal from '../components/CreateServiceModal';
import CreateReviewModal from '../components/CreateReviewModal';

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { requireAuth } = useAuthPrompt();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const isOwnProfile = [currentUser?.id, currentUser?._id].filter(Boolean).includes(userId);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (isOwnProfile && !loading) {
      navigate('/profile');
    }
  }, [isOwnProfile, loading, navigate]);

  useEffect(() => {
    if (
      isAuthenticated &&
      profileUser?.type === 'provider' &&
      profileUser?.isAvailableAsProvider &&
      location.state?.pendingAction === 'request-service'
    ) {
      setShowServiceModal(true);
      navigate(`/user/${userId}`, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate, profileUser, userId]);

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

  const formatRating = (value) => Number(value || 0).toFixed(1);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <div className="py-8 text-center">
            <p className="mb-4 text-red-600 dark:text-red-400">{error || 'Usuário não encontrado'}</p>
            <Button onClick={() => navigate(-1)}>Voltar</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-white shadow-sm dark:bg-gray-800">
        <div className="container-mobile mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
            {profileUser.name}
          </h1>
        </div>
      </div>

      <div className="container-mobile mx-auto space-y-4 px-4 pt-6">
        <Card>
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src={profileUser.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(profileUser.name)}&size=200&background=random`}
              alt={profileUser.name}
              className="mb-4 h-24 w-24 rounded-full object-cover"
            />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {profileUser.name}
            </h2>
            <span className="mt-2 inline-block rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200">
              {getUserTypeLabel(profileUser.type)}
            </span>
          </div>

          <div className="mb-6 space-y-3">
            {isAuthenticated && profileUser.email && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Mail className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="truncate">{profileUser.email}</span>
              </div>
            )}
            {isAuthenticated && profileUser.phone && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <Phone className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span>{profileUser.phone}</span>
              </div>
            )}
            {profileUser.city && (
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span className="truncate">{[profileUser.city, profileUser.state].filter(Boolean).join(', ')}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Calendar className="h-5 w-5 flex-shrink-0 text-gray-400" />
              <span>Membro desde {new Date(profileUser.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div className="space-y-2">
            {profileUser.type === 'provider' && profileUser.isAvailableAsProvider && (
              <Button
                variant="primary"
                fullWidth
                icon={Send}
                onClick={() => {
                  if (!requireAuth({
                    suggestedType: 'client',
                    returnTo: `/user/${userId}`,
                    returnState: { pendingAction: 'request-service' }
                  })) {
                    return;
                  }
                  setShowServiceModal(true);
                }}
              >
                Solicitar Serviço
              </Button>
            )}
            <Button
              variant="secondary"
              fullWidth
              icon={MessageCircle}
              onClick={() => {
                if (!requireAuth({
                  suggestedType: 'client',
                  returnTo: `/user/${userId}`
                })) {
                  return;
                }
                setShowReviewModal(true);
              }}
            >
              Avaliar Usuário
            </Button>
          </div>
        </Card>

        {profileUser.type === 'provider' && (
          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Informações Profissionais
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <span>{profileUser.category || 'Categoria não informada'}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span>R$ {profileUser.pricePerHour || 0}/hora</span>
              </div>

              {profileUser.description && (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {profileUser.description}
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${profileUser.isAvailableAsProvider ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {profileUser.isAvailableAsProvider ? 'Disponível para serviços' : 'Indisponível no momento'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {profileUser.type === 'company' && profileUser.companyDescription && (
          <Card>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Building2 className="h-5 w-5" />
              Informações da Empresa
            </h3>
            <div>
              <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">Sobre a empresa</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {profileUser.companyDescription}
              </p>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Avaliações
          </h3>

          <div className="space-y-3">
            {(profileUser.type === 'provider' || profileUser.type === 'client') && (
              <RatingCard
                icon={Star}
                label="Como Cliente"
                rating={formatRating(profileUser.clientRating)}
                count={profileUser.clientReviewCount || 0}
                variant="yellow"
              />
            )}

            {profileUser.type === 'provider' && (
              <RatingCard
                icon={Award}
                label="Como Prestador"
                rating={formatRating(profileUser.providerRating)}
                count={profileUser.providerReviewCount || 0}
                variant="green"
              />
            )}
          </div>
        </Card>

        <ReviewsSection userId={profileUser._id} userType={profileUser.type} />
      </div>

      {profileUser.type === 'provider' && (
        <CreateServiceModal
          isOpen={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          provider={profileUser}
          onSuccess={() => setShowServiceModal(false)}
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

const RatingCard = ({ icon: Icon, label, rating, count, variant }) => {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colors[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {rating}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({count} avaliações)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
