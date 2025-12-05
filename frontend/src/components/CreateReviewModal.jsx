// frontend/src/components/CreateReviewModal.jsx
import { useState } from 'react';
import { Star, AlertTriangle, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import axios from 'axios';

const CreateReviewModal = ({ isOpen, onClose, userId, userType, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [needsReview, setNeedsReview] = useState(false);

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
      const response = await axios.post('/api/reviews', {
        reviewedUserId: userId,
        type: userType,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Verificar se foi para revisão
      if (response.data.needsReview) {
        setNeedsReview(true);
        // Não fecha o modal, mostra aviso
      } else {
        alert('✅ Avaliação publicada com sucesso!');
        setRating(0);
        setComment('');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAfterReview = () => {
    setRating(0);
    setComment('');
    setNeedsReview(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  // Se a avaliação foi enviada para revisão
  if (needsReview) {
    return (
      <Modal isOpen={isOpen} onClose={handleCloseAfterReview} title="Avaliação em Revisão" size="md">
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Avaliação Enviada para Revisão
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sua avaliação foi detectada como potencialmente inadequada e será revisada por nossa equipe antes de ser publicada.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Por que isso acontece?</strong><br/>
              Nosso sistema automático detectou palavras ou frases que podem violar nossas diretrizes de comunidade. Um moderador humano irá revisar sua avaliação em breve.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sua avaliação:
            </p>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
              "{comment}"
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleCloseAfterReview}
            className="min-h-[44px]"
          >
            Entendi
          </Button>
        </div>
      </Modal>
    );
  }

  // Formulário normal
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Avaliar Usuário" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Aviso sobre sistema híbrido */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Avaliação Instantânea</p>
              <p>Sua avaliação será publicada imediatamente, a menos que nosso sistema detecte conteúdo inadequado.</p>
            </div>
          </div>
        </div>

        {/* Diretrizes */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            ⚠️ Diretrizes da Comunidade
          </p>
          <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>• Seja respeitoso e construtivo</li>
            <li>• Evite linguagem ofensiva ou discriminatória</li>
            <li>• Foque na experiência, não na pessoa</li>
            <li>• Não faça ameaças ou acusações sem provas</li>
          </ul>
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
            placeholder="Compartilhe sua experiência de forma respeitosa e construtiva... (mínimo 10 caracteres)"
            className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 text-base"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mínimo 10 caracteres
            </p>
            <p className={`text-xs ${
              comment.length > 500 
                ? 'text-red-500' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
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
            disabled={rating === 0 || comment.length < 10 || comment.length > 500}
            className="min-h-[44px]"
          >
            Publicar Avaliação
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