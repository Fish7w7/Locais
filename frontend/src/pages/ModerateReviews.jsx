// frontend/src/pages/ModerateReviews.jsx
import { useState, useEffect } from 'react';
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const ModerateReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [moderating, setModerating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [filter, setFilter] = useState('all'); // all, flagged, auto_detected

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
      alert('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId, action) => {
    if (action === 'reject' && !rejectionReason) {
      alert('Informe o motivo da rejeição');
      return;
    }

    if (!confirm(`Tem certeza que deseja ${
      action === 'approve' ? 'aprovar' : 
      action === 'reject' ? 'rejeitar' : 
      'manter em revisão'
    } esta avaliação?`)) {
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
        alert(`✅ ${data.message}`);
        setSelectedReview(null);
        setRejectionReason('');
        loadFlaggedReviews();
      } else {
        alert(`❌ ${data.message || 'Erro ao moderar'}`);
      }
    } catch (error) {
      alert('Erro ao moderar avaliação');
      console.error(error);
    } finally {
      setModerating(false);
    }
  };

  const toggleExpand = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
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

  const filteredReviews = reviews.filter(review => {
    if (filter === 'flagged') return review.status === 'flagged';
    if (filter === 'auto_detected') return review.status === 'under_review';
    return true;
  });

  const stats = {
    total: reviews.length,
    flagged: reviews.filter(r => r.status === 'flagged').length,
    autoDetected: reviews.filter(r => r.status === 'under_review').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Moderar Avaliações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Sistema de Moderação Híbrido
            </p>
          </div>
          <Button
            size="sm"
            icon={RefreshCw}
            onClick={loadFlaggedReviews}
          >
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.flagged}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">Denunciadas</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.autoDetected}
            </p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Auto-detectadas</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Como funciona o sistema híbrido?</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Publicação Automática:</strong> Avaliações são publicadas imediatamente</li>
              <li>• <strong>Auto-Detecção:</strong> IA detecta linguagem potencialmente ofensiva</li>
              <li>• <strong>Denúncias:</strong> 1 denúncia = marcada para revisão</li>
              <li>• <strong>Moderação Manual:</strong> Você revisa apenas casos problemáticos</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Todas ({stats.total})
        </button>
        <button
          onClick={() => setFilter('flagged')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'flagged'
              ? 'bg-red-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Denunciadas ({stats.flagged})
        </button>
        <button
          onClick={() => setFilter('auto_detected')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'auto_detected'
              ? 'bg-yellow-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
          }`}
        >
          Auto-detectadas ({stats.autoDetected})
        </button>
      </div>

      {/* Lista de Avaliações */}
      {filteredReviews.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Tudo limpo! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Não há avaliações {
                filter === 'flagged' ? 'denunciadas' :
                filter === 'auto_detected' ? 'auto-detectadas' :
                'problemáticas'
              } no momento
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => {
            const isExpanded = expandedReviews.has(review._id);
            
            return (
              <Card key={review._id} className="overflow-hidden">
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
                  <span className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                {/* Quick Preview */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={review.reviewerId?.avatar || `https://ui-avatars.com/api/?name=${review.reviewerId?.name}`}
                    alt={review.reviewerId?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {review.reviewerId?.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {review.comment}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleExpand(review._id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Full Comment */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </div>

                    {/* Avaliado */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Avaliado:
                      </p>
                      <div className="flex items-center gap-2">
                        <img
                          src={review.reviewedUserId?.avatar || `https://ui-avatars.com/api/?name=${review.reviewedUserId?.name}`}
                          alt={review.reviewedUserId?.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {review.reviewedUserId?.name}
                        </span>
                      </div>
                    </div>

                    {/* Auto-flag Reason */}
                    {review.autoFlaggedReason && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>🤖 Detectado automaticamente:</strong> {review.autoFlaggedReason}
                        </p>
                      </div>
                    )}

                    {/* Denúncias */}
                    {review.reports && review.reports.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white mb-2">
                          Denúncias ({review.reports.length}):
                        </p>
                        <div className="space-y-2">
                          {review.reports.map((report, idx) => (
                            <div key={idx} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
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
                                <p className="text-xs text-red-600 dark:text-red-400 ml-2 whitespace-nowrap">
                                  {new Date(report.reportedAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações de Moderação */}
                    {selectedReview === review._id ? (
                      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Motivo da rejeição (será enviado ao usuário)"
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            icon={CheckCircle}
                            onClick={() => handleModerate(review._id, 'approve')}
                            disabled={moderating}
                            fullWidth
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon={XCircle}
                            onClick={() => handleModerate(review._id, 'reject')}
                            disabled={moderating}
                            fullWidth
                          >
                            Rejeitar
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedReview(null);
                              setRejectionReason('');
                            }}
                            disabled={moderating}
                            fullWidth
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => setSelectedReview(review._id)}
                      >
                        Moderar
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModerateReviewsPage;