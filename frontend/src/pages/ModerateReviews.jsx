// frontend/src/pages/ModerateReviews.jsx
import { useState, useEffect } from 'react';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Star
} from 'lucide-react';

const ModerateReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [moderating, setModerating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadFlaggedReviews();
  }, []);

  const loadFlaggedReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews/flagged', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, action) => {
    if (action === 'reject' && !rejectionReason) {
      alert('Informe o motivo da rejeição');
      return;
    }

    try {
      setModerating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${reviewId}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason : null
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setSelectedReview(null);
        setRejectionReason('');
        loadFlaggedReviews();
      } else {
        alert(data.message || 'Erro ao moderar');
      }
    } catch (error) {
      alert('Erro ao moderar avaliação');
      console.error(error);
    } finally {
      setModerating(false);
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      offensive_language: 'Linguagem ofensiva',
      spam: 'Spam',
      false_information: 'Informação falsa',
      harassment: 'Assédio',
      inappropriate: 'Inapropriado',
      other: 'Outro'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Moderar Avaliações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'} aguardando revisão
            </p>
          </div>
          <button
            onClick={loadFlaggedReviews}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Sistema de Moderação Híbrido</p>
            <p>Avaliações são publicadas automaticamente. Você vê apenas as que foram denunciadas ou detectadas como problemáticas.</p>
          </div>
        </div>
      </div>

      {/* Lista de Avaliações */}
      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Tudo limpo! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Não há avaliações problemáticas no momento
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                {review.status === 'flagged' && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm font-medium flex items-center gap-1">
                    <Flag className="w-4 h-4" />
                    {review.reportsCount} {review.reportsCount === 1 ? 'denúncia' : 'denúncias'}
                  </span>
                )}
                {review.status === 'under_review' && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-sm font-medium flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Auto-detectado
                  </span>
                )}
              </div>

              {/* Avaliador e Avaliado */}
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avaliador:</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={review.reviewerId?.avatar || `https://ui-avatars.com/api/?name=${review.reviewerId?.name}`}
                      alt={review.reviewerId?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {review.reviewerId?.name}
                      </p>
                      <p className="text-xs text-gray-500">{review.reviewerId?.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avaliado:</p>
                  <div className="flex items-center gap-2">
                    <img
                      src={review.reviewedUserId?.avatar || `https://ui-avatars.com/api/?name=${review.reviewedUserId?.name}`}
                      alt={review.reviewedUserId?.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {review.reviewedUserId?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Avaliação */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-900 dark:text-white">{review.comment}</p>
              </div>

              {/* Auto-flag Reason */}
              {review.autoFlaggedReason && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Detectado automaticamente:</strong> {review.autoFlaggedReason}
                  </p>
                </div>
              )}

              {/* Denúncias */}
              {review.reports && review.reports.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">
                    Denúncias ({review.reports.length}):
                  </p>
                  <div className="space-y-2">
                    {review.reports.map((report, idx) => (
                      <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-900 dark:text-red-100">
                              {getReasonLabel(report.reason)}
                            </p>
                            {report.description && (
                              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                {report.description}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400 ml-2">
                            {new Date(report.reportedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              {selectedReview === review._id ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Motivo da rejeição (será enviado ao usuário)"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleModerate(review._id, 'approve')}
                      disabled={moderating}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleModerate(review._id, 'reject')}
                      disabled={moderating}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReview(null);
                        setRejectionReason('');
                      }}
                      disabled={moderating}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedReview(review._id)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Moderar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerateReviewsPage;