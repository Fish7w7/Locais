// frontend/src/components/ReviewModerationStats.jsx
import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewModerationStats = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/review-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Moderação de Avaliações
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-red-600">{stats.flagged}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Denunciadas</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats.underReview}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Auto-detectadas</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalReports}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total de denúncias</p>
        </div>
      </div>
      {stats.flagged > 0 && (
        <div className="mt-4">
          <button
            onClick={() => navigate('/admin/reviews')}
            className="block w-full text-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Ver Avaliações Pendentes
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewModerationStats;