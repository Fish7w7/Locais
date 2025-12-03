// frontend/src/components/CreateReviewModal.jsx
import { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import axios from 'axios';

const CreateReviewModal = ({ isOpen, onClose, userId, userType, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    if (comment.length < 10) {
      alert('O comentário deve ter no mínimo 10 caracteres');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reviews', {
        reviewedUserId: userId,
        type: userType,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Avaliação enviada! Ela será analisada antes de aparecer no perfil.');
      setRating(0);
      setComment('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Avaliar Usuário" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Aviso */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Sua avaliação passará por moderação antes de ser publicada. Seja respeitoso e construtivo!
          </p>
        </div>

        {/* Estrelas */}
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sua Avaliação
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 touch-manipulation"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {rating === 5 && 'Excelente! ⭐'}
              {rating === 4 && 'Muito bom! 👍'}
              {rating === 3 && 'Bom 👌'}
              {rating === 2 && 'Regular 😐'}
              {rating === 1 && 'Ruim 👎'}
            </p>
          )}
        </div>

        {/* Comentário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Comentário
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
            minLength={10}
            maxLength={500}
            placeholder="Compartilhe sua experiência... (mínimo 10 caracteres)"
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mínimo 10 caracteres
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {comment.length}/500
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={rating === 0 || comment.length < 10}
            className="min-h-[44px]"
          >
            Enviar Avaliação
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
            className="sm:w-auto min-h-[44px]"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateReviewModal;