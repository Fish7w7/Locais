// frontend/src/components/ReviewsSection.jsx
import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Plus } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import axios from 'axios';
import CreateReviewModal from './CreateReviewModal';

const ReviewsSection = ({ userId, userType }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('provider');
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!userId) {
    console.warn('⚠️ ReviewsSection: userId não fornecido');
    return null;
  }

  useEffect(() => {
    if (!userId) {
      console.warn('⚠️ useEffect: userId não disponível');
      return;
    }
    
    console.log(`🔄 Carregando avaliações: userId=${userId}, type=${selectedType}`);
    loadReviews();
  }, [userId, selectedType]);

  const loadReviews = async () => {
    if (!userId) {
      console.error('❌ loadReviews chamado sem userId');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/api/reviews/user/${userId}`, {
        params: { 
          type: selectedType,
          status: 'approved'
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`✅ ${response.data.reviews?.length || 0} avaliações carregadas (${selectedType})`);
      
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error('❌ Erro ao carregar avaliações:', error.response?.status, error.message);
            if (error.response?.status === 429) {
        console.error('⚠️ RATE LIMIT: Muitas requisições. Aguarde alguns segundos.');
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId, helpful) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/reviews/${reviewId}/helpful`, 
        { helpful },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadReviews();
    } catch (error) {
      console.error('Erro ao marcar avaliação:', error);
      alert('Erro ao marcar avaliação como útil');
    }
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Avaliações
        </h3>
        <Button
          size="sm"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Avaliar
        </Button>
      </div>

      {/* Tabs - APENAS SE FOR PRESTADOR */}
      {userType === 'provider' && (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('provider')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              selectedType === 'provider'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Como Prestador
          </button>
          <button
            onClick={() => setSelectedType('client')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px] ${
              selectedType === 'client'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Como Cliente
          </button>
        </div>
      )}

      {/* Estatísticas */}
      {stats && stats.total > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.average.toFixed(1)}
                </span>
                {renderStars(Math.round(stats.average))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>

            {/* Distribuição */}
            <div className="space-y-1 text-sm">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-8 text-gray-600 dark:text-gray-400">
                    {star} ★
                  </span>
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{
                        width: `${stats.total > 0 ? (stats.distribution[star] / stats.total) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="w-8 text-gray-600 dark:text-gray-400">
                    {stats.distribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Avaliações */}
      {loading ? (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </Card>
      ) : reviews.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma avaliação {selectedType === 'provider' ? 'como prestador' : 'como cliente'} ainda
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review._id}>
              <div className="space-y-3">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.reviewerId?.avatar || `https://ui-avatars.com/api/?name=${review.reviewerId?.name}&background=random`}
                      alt={review.reviewerId?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {review.reviewerId?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {/* Comentário */}
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {review.comment}
                </p>

                {/* Útil/Não útil */}
                <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleHelpful(review._id, true)}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpful || 0}</span>
                  </button>
                  <button
                    onClick={() => handleHelpful(review._id, false)}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>{review.notHelpful || 0}</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criar Avaliação */}
      <CreateReviewModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={userId}
        userType={selectedType}
        onSuccess={() => {
          setShowCreateModal(false);
          loadReviews(); 
        }}
      />
    </div>
  );
};

export default ReviewsSection;