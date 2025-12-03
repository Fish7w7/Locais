// frontend/src/pages/ModerateReviews.jsx
import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Star, MessageCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import UserProfileLink from '../components/UserProfileLink';

const ModerateReviews = () => {
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/reviews/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setPendingReviews(response.data.reviews || []);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      setError('Erro ao carregar avaliações pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, status, rejectionReason = null) => {
    try {
      setProcessingId(reviewId);
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/reviews/${reviewId}/moderate`, {
        status,
        rejectionReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(status === 'approved' ? 'Avaliação aprovada!' : 'Avaliação rejeitada!');
      loadPendingReviews();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao moderar avaliação');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (reviewId) => {
    handleModerate(reviewId, 'approved');
  };

  const handleReject = (reviewId) => {
    const reason = prompt('Motivo da rejeição (opcional):');
    handleModerate(reviewId, 'rejected', reason);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Moderar Avaliações
        </h1>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Moderar Avaliações
        </h1>
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={loadPendingReviews}>Tentar Novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Moderar Avaliações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {pendingReviews.length} {pendingReviews.length === 1 ? 'avaliação pendente' : 'avaliações pendentes'}
          </p>
        </div>
        <Button size="sm" onClick={loadPendingReviews}>
          Atualizar
        </Button>
      </div>

      {/* Aviso */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Moderação de Avaliações
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Avaliações aprovadas serão exibidas no perfil do usuário e afetarão sua nota média. 
              Rejeite apenas conteúdo ofensivo ou falso.
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de Avaliações */}
      {pendingReviews.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma avaliação pendente
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingReviews.map((review) => (
            <Card key={review._id}>
              <div className="space-y-4">
                {/* Avaliador */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Avaliação feita por:
                  </p>
                  <UserProfileLink
                    userId={review.reviewerId?._id}
                    userName={review.reviewerId?.name}
                    userAvatar={review.reviewerId?.avatar}
                    subtitle={review.reviewerId?.email}
                  />
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-700"></div>

                {/* Avaliado */}
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Avaliando:
                  </p>
                  <UserProfileLink
                    userId={review.reviewedUserId?._id}
                    userName={review.reviewedUserId?.name}
                    userAvatar={review.reviewedUserId?.avatar}
                    subtitle={`Como ${review.type === 'provider' ? 'Prestador' : 'Cliente'}`}
                  />
                </div>

                {/* Rating e Comentário */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Avaliação:
                    </span>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {review.comment}
                  </p>
                </div>

                {/* Informações adicionais */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Enviada em {new Date(review.createdAt).toLocaleDateString('pt-BR')}</span>
                  {review.serviceId && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      Relacionada a um serviço
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    fullWidth
                    icon={CheckCircle}
                    onClick={() => handleApprove(review._id)}
                    loading={processingId === review._id}
                    disabled={processingId !== null}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    icon={XCircle}
                    onClick={() => handleReject(review._id)}
                    disabled={processingId !== null}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerateReviews;