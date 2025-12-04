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
      serviceId: serviceId || null
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou este usuário'
      });
    }

    const review = await Review.create({
      reviewedUserId,
      reviewerId: req.user.id,
      type,
      rating,
      comment,
      serviceId: serviceId || null,
      status: 'approved'
    });

    if (review.status === 'approved') {
      if (type === 'provider') {
        const totalRating = (reviewedUser.providerRating * reviewedUser.providerReviewCount) + rating;
        reviewedUser.providerReviewCount += 1;
        reviewedUser.providerRating = totalRating / reviewedUser.providerReviewCount;
      } else {
        const totalRating = (reviewedUser.clientRating * reviewedUser.clientReviewCount) + rating;
        reviewedUser.clientReviewCount += 1;
        reviewedUser.clientRating = totalRating / reviewedUser.clientReviewCount;
      }
      await reviewedUser.save();
    }

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name avatar')
      .populate('reviewedUserId', 'name');

    res.status(201).json({
      success: true,
      message: review.status === 'approved' 
        ? 'Avaliação publicada com sucesso!' 
        : 'Avaliação enviada para revisão',
      review: populatedReview
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Você já avaliou este usuário'
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
    const { type, status } = req.query;
    
    const query = {
      reviewedUserId: req.params.userId,
      status: status || 'approved'
    };
    
    if (type) {
      query.type = type;
    }

    const reviews = await Review.find(query)
      .populate('reviewerId', 'name avatar')
      .populate('reviewedUserId', 'name')
      .sort('-createdAt');

    // Calcular estatísticas
    const stats = {
      total: reviews.length,
      average: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      stats.average = sum / reviews.length;
      
      reviews.forEach(review => {
        stats.distribution[review.rating]++;
      });
    }

    res.json({
      success: true,
      count: reviews.length,
      reviews,
      stats
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avaliações',
      error: error.message
    });
  }
};

// @desc    Denunciar avaliação
// @route   POST /api/reviews/:id/report
// @access  Private
export const reportReview = async (req, res) => {
  try {
    const { reason, description } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da denúncia é obrigatório'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    const alreadyReported = review.reports.some(
      report => report.reporterId.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'Você já denunciou esta avaliação'
      });
    }

    review.reports.push({
      reporterId: req.user.id,
      reason,
      description: description || ''
    });

    review.reportsCount += 1;

    if (review.reportsCount >= 3 && review.status === 'approved') {
      review.status = 'flagged';
      console.log(`⚠️ Avaliação ${review._id} auto-flagged: ${review.reportsCount} denúncias`);
    }

    await review.save();

    res.json({
      success: true,
      message: 'Denúncia registrada com sucesso',
      reportsCount: review.reportsCount
    });
  } catch (error) {
    console.error('Erro ao denunciar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao denunciar avaliação',
      error: error.message
    });
  }
};

// @desc    Obter avaliações flagged (Admin)
// @route   GET /api/reviews/flagged
// @access  Private (Admin)
export const getFlaggedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      $or: [
        { status: 'flagged' },
        { status: 'under_review' }
      ]
    })
      .populate('reviewerId', 'name avatar email')
      .populate('reviewedUserId', 'name avatar')
      .populate('reports.reporterId', 'name email')
      .sort('-reportsCount -createdAt');

    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Erro ao buscar avaliações flagged:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar avaliações flagged',
      error: error.message
    });
  }
};

// @desc    Moderar avaliação (Admin)
// @route   PUT /api/reviews/:id/moderate
// @access  Private (Admin)
export const moderateReview = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    if (action === 'approve') {
      review.status = 'approved';
      review.reports = [];
      review.reportsCount = 0;
      review.autoFlaggedReason = null;
      
    } else if (action === 'reject') {
      const oldStatus = review.status;
      review.status = 'rejected';
      review.rejectionReason = rejectionReason || 'Conteúdo inapropriado';
      
      if (oldStatus === 'approved') {
        const reviewedUser = await User.findById(review.reviewedUserId);
        
        if (review.type === 'provider') {
          const totalRating = (reviewedUser.providerRating * reviewedUser.providerReviewCount) - review.rating;
          reviewedUser.providerReviewCount = Math.max(0, reviewedUser.providerReviewCount - 1);
          reviewedUser.providerRating = reviewedUser.providerReviewCount > 0 
            ? totalRating / reviewedUser.providerReviewCount 
            : 0;
        } else {
          const totalRating = (reviewedUser.clientRating * reviewedUser.clientReviewCount) - review.rating;
          reviewedUser.clientReviewCount = Math.max(0, reviewedUser.clientReviewCount - 1);
          reviewedUser.clientRating = reviewedUser.clientReviewCount > 0 
            ? totalRating / reviewedUser.clientReviewCount 
            : 0;
        }
        
        await reviewedUser.save();
      }
      
    } else if (action === 'keep_flagged') {
      review.status = 'flagged';
    }

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name avatar')
      .populate('reviewedUserId', 'name')
      .populate('moderatedBy', 'name');

    res.json({
      success: true,
      message: `Avaliação ${action === 'approve' ? 'aprovada' : action === 'reject' ? 'rejeitada' : 'mantida em revisão'}`,
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
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Apenas o autor ou admin pode deletar
    if (review.reviewerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Não autorizado'
      });
    }

    // Atualizar ratings se a avaliação estava aprovada
    if (review.status === 'approved') {
      const reviewedUser = await User.findById(review.reviewedUserId);
      
      if (review.type === 'provider') {
        const totalRating = (reviewedUser.providerRating * reviewedUser.providerReviewCount) - review.rating;
        reviewedUser.providerReviewCount = Math.max(0, reviewedUser.providerReviewCount - 1);
        reviewedUser.providerRating = reviewedUser.providerReviewCount > 0 
          ? totalRating / reviewedUser.providerReviewCount 
          : 0;
      } else {
        const totalRating = (reviewedUser.clientRating * reviewedUser.clientReviewCount) - review.rating;
        reviewedUser.clientReviewCount = Math.max(0, reviewedUser.clientReviewCount - 1);
        reviewedUser.clientRating = reviewedUser.clientReviewCount > 0 
          ? totalRating / reviewedUser.clientReviewCount 
          : 0;
      }
      
      await reviewedUser.save();
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