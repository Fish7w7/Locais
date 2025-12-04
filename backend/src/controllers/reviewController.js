// backend/src/controllers/reviewController.js
import Review from '../models/Review.js';
import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';

// @desc    Criar avaliação
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { reviewedUserId, type, rating, comment, serviceId } = req.body;

    const reviewedUser = await User.findById(reviewedUserId);
    if (!reviewedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (reviewedUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode avaliar a si mesmo'
      });
    }

    const existingReview = await Review.findOne({
      reviewerId: req.user.id,
      reviewedUserId,
      $or: [
        { serviceId: serviceId || null },
        { serviceId: null }
      ]
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou este usuário. Cada pessoa pode ser avaliada apenas uma vez.'
      });
    }

    // Criar avaliação
    const review = await Review.create({
      reviewedUserId,
      reviewerId: req.user.id,
      type,
      rating,
      comment,
      serviceId: serviceId || null,
      status: 'pending'
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name avatar')
      .populate('reviewedUserId', 'name');

    res.status(201).json({
      success: true,
      review: populatedReview
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou este usuário anteriormente'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao criar avaliação',
      error: error.message
    });
  }
};

// @desc    Obter avaliações de um usuário
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, status = 'approved' } = req.query;

    const query = {
      reviewedUserId: userId,
      status
    };

    if (type) {
      query.type = type;
    }

    console.log(' Query de busca:', JSON.stringify(query));

    const reviews = await Review.find(query)
      .populate('reviewerId', 'name avatar')
      .sort('-createdAt');

    console.log(` Encontradas ${reviews.length} avaliações`);

    // Calcular estatísticas
    const stats = {
      total: reviews.length,
      average: reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0,
      distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };

    res.json({
      success: true,
      reviews,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avaliações',
      error: error.message
    });
  }
};

// @desc    Obter avaliações pendentes (Admin)
// @route   GET /api/reviews/pending
// @access  Private (Admin)
export const getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('reviewerId', 'name avatar email')
      .populate('reviewedUserId', 'name avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações pendentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avaliações pendentes',
      error: error.message
    });
  }
};

// @desc    Moderar avaliação (Admin)
// @route   PUT /api/reviews/:id/moderate
// @access  Private (Admin)
export const moderateReview = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    review.status = status;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    if (status === 'rejected' && rejectionReason) {
      review.rejectionReason = rejectionReason;
    }

    if (status === 'approved') {
      const reviewedUser = await User.findById(review.reviewedUserId);
      
      if (review.type === 'provider') {
        const totalRating = (reviewedUser.providerRating * reviewedUser.providerReviewCount) + review.rating;
        reviewedUser.providerReviewCount += 1;
        reviewedUser.providerRating = totalRating / reviewedUser.providerReviewCount;
      } else {
        const totalRating = (reviewedUser.clientRating * reviewedUser.clientReviewCount) + review.rating;
        reviewedUser.clientReviewCount += 1;
        reviewedUser.clientRating = totalRating / reviewedUser.clientReviewCount;
      }

      await reviewedUser.save();
    }

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name avatar')
      .populate('reviewedUserId', 'name')
      .populate('moderatedBy', 'name');

    res.json({
      success: true,
      review: populatedReview
    });
  } catch (error) {
    console.error('Erro ao moderar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao moderar avaliação',
      error: error.message
    });
  }
};

// @desc    Marcar avaliação como útil
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markHelpful = async (req, res) => {
  try {
    const { helpful } = req.body; 

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    if (helpful) {
      review.helpful += 1;
    } else {
      review.notHelpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      helpful: review.helpful,
      notHelpful: review.notHelpful
    });
  } catch (error) {
    console.error('Erro ao marcar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar avaliação',
      error: error.message
    });
  }
};

// @desc    Deletar avaliação
// @route   DELETE /api/reviews/:id
// @access  Private (Dono ou Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const isOwner = review.reviewerId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar esta avaliação'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Avaliação deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar avaliação',
      error: error.message
    });
  }
};