// backend/src/controllers/reviewController.js
import Review from '../models/Review.js';
import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';
import mongoose from 'mongoose';

// @desc    Criar avaliação
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { reviewedUserId, type, rating, comment, serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ success: false,
        message: 'serviceId e obrigatorio para avaliar um servico'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(serviceId) || !mongoose.Types.ObjectId.isValid(reviewedUserId)) {
      return res.status(400).json({ success: false,
        message: 'Dados de avaliacao invalidos'
      });
    }

    const serviceRequest = await ServiceRequest.findById(serviceId);
    if (!serviceRequest || serviceRequest.status !== 'completed') {
      return res.status(400).json({ success: false,
        message: 'Avaliacao permitida apenas para servicos concluidos'
      });
    }

    const isRequester = serviceRequest.requesterId.toString() === req.user.id;
    const isProvider = serviceRequest.providerId.toString() === req.user.id;

    if (!isRequester && !isProvider) {
      return res.status(403).json({ success: false,
        message: 'Voce nao participou deste servico'
      });
    }

    const expectedReviewedUserId = isRequester
      ? serviceRequest.providerId.toString()
      : serviceRequest.requesterId.toString();

    if (String(reviewedUserId) !== expectedReviewedUserId) {
      return res.status(400).json({ success: false,
        message: 'Usuario avaliado nao faz parte deste servico'
      });
    }

    if ((isRequester && type !== 'provider') || (isProvider && type !== 'client')) {
      return res.status(400).json({ success: false,
        message: 'Tipo de avaliacao invalido para este servico'
      });
    }

    const reviewedUser = await User.findById(reviewedUserId);
    if (!reviewedUser || reviewedUser.isActive === false || reviewedUser.isDeleted === true) {
      return res.status(404).json({ success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (reviewedUserId === req.user.id) {
      return res.status(400).json({ success: false,
        message: 'Você não pode avaliar a si mesmo'
      });
    }

    const existingReview = await Review.findOne({ reviewerId: req.user.id,
      reviewedUserId,
      serviceId
    });

    if (existingReview) {
      return res.status(400).json({ success: false,
        message: 'Você já avaliou este usuário para este serviço'
      });
    }

    // CRIAR AVALIAÇÃO - Status definido pelo pre-save hook
    const review = await Review.create({
      reviewedUserId,
      reviewerId: req.user.id,
      type,
      rating,
      comment,
      serviceId
    });

    if (review.status === 'approved') {
      if (type === 'provider') {
        serviceRequest.providerRating = rating;
        serviceRequest.providerReview = comment;
        const totalRating = (reviewedUser.providerRating * reviewedUser.providerReviewCount) + rating;
        reviewedUser.providerReviewCount += 1;
        reviewedUser.providerRating = totalRating / reviewedUser.providerReviewCount;
      } else {
        serviceRequest.clientRating = rating;
        serviceRequest.clientReview = comment;
        const totalRating = (reviewedUser.clientRating * reviewedUser.clientReviewCount) + rating;
        reviewedUser.clientReviewCount += 1;
        reviewedUser.clientRating = totalRating / reviewedUser.clientReviewCount;
      }
      await Promise.all([reviewedUser.save(), serviceRequest.save()]);
    }

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'name avatar')
      .populate('reviewedUserId', 'name');

    let message = 'Avaliação publicada com sucesso!';
    if (review.status === 'under_review') {
      message = '⚠️ Sua avaliação foi enviada para revisão devido a conteúdo potencialmente inadequado. Um moderador irá analisá-la em breve.';
    }

    res.status(201).json({
      success: true,
      message,
      review: populatedReview,
      needsReview: review.status === 'under_review'
    });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ success: false,
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
    
    const query = { reviewedUserId: req.params.userId,
      status: status || 'approved'
    };
    
    if (type) {
      query.type = type;
    }

    const reviews = await Review.find(query)
      .select('-helpfulVotes')
      .populate('reviewerId', 'name avatar')
      .populate('reviewedUserId', 'name')
      .sort('-createdAt');

    // Calcular estatísticas
    const stats = { total: reviews.length,
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
      return res.status(400).json({ success: false,
        message: 'Motivo da denúncia é obrigatório'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar se já denunciou
    const alreadyReported = review.reports.some(
      report => report.reporterId.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({ success: false,
        message: 'Você já denunciou esta avaliação'
      });
    }

    // Adicionar denúncia
    review.reports.push({
      reporterId: req.user.id,
      reason,
      description: description || ''
    });

    review.reportsCount += 1;

    // AUTO-FLAG: 3+ denúncias = flagged
    if (review.reportsCount >= 1 && review.status === 'approved') {
      review.status = 'flagged';
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Avaliacao ${review._id} sinalizada: ${review.reportsCount} denuncias`);
      }
    }

    await review.save();

    res.json({
      success: true,
      message: 'Denúncia registrada com sucesso. Obrigado por ajudar a manter a comunidade segura!',
      reportsCount: review.reportsCount,
      isFlagged: review.status === 'flagged'
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
    const reviews = await Review.find({ $or: [
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

    if (!['approve', 'reject', 'keep_flagged'].includes(action)) {
      return res.status(400).json({ success: false,
        message: 'Ação inválida'
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false,
        message: 'Avaliação não encontrada'
      });
    }

    const oldStatus = review.status;

    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    if (action === 'approve') {
      review.status = 'approved';
      review.reports = [];
      review.reportsCount = 0;
      review.autoFlaggedReason = null;
      
      // Adicionar ao rating se estava em revisão
      if (oldStatus !== 'approved') {
        const reviewedUser = await User.findById(review.reviewedUserId);
        const serviceRequest = await ServiceRequest.findById(review.serviceId);
        
        if (review.type === 'provider') {
          if (serviceRequest) {
            serviceRequest.providerRating = review.rating;
            serviceRequest.providerReview = review.comment;
          }
          const totalRating = (reviewedUser.providerRating * reviewedUser.providerReviewCount) + review.rating;
          reviewedUser.providerReviewCount += 1;
          reviewedUser.providerRating = totalRating / reviewedUser.providerReviewCount;
        } else {
          if (serviceRequest) {
            serviceRequest.clientRating = review.rating;
            serviceRequest.clientReview = review.comment;
          }
          const totalRating = (reviewedUser.clientRating * reviewedUser.clientReviewCount) + review.rating;
          reviewedUser.clientReviewCount += 1;
          reviewedUser.clientRating = totalRating / reviewedUser.clientReviewCount;
        }
        
        await Promise.all([
          reviewedUser.save(),
          serviceRequest ? serviceRequest.save() : Promise.resolve()
        ]);
      }
      
    } else if (action === 'reject') {
      review.status = 'rejected';
      review.rejectionReason = rejectionReason || 'Conteúdo inapropriado';
      
      // Remover do rating se estava aprovado
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

    const messages = { approve: 'Avaliação aprovada e publicada',
      reject: 'Avaliação rejeitada e removida',
      keep_flagged: 'Avaliação mantida em revisão'
    };

    res.json({
      success: true,
      message: messages[action],
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
    if (typeof req.body.helpful !== 'boolean') {
      return res.status(400).json({ success: false,
        message: 'Voto invalido'
      });
    }

    const { helpful } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false,
        message: 'Avaliação não encontrada'
      });
    }

    if (review.reviewerId.toString() === req.user.id) {
      return res.status(400).json({ success: false,
        message: 'Voce nao pode votar na propria avaliacao'
      });
    }

    const existingVote = review.helpfulVotes.find(
      vote => vote.userId.toString() === req.user.id
    );

    if (existingVote && existingVote.helpful === helpful) {
      return res.status(400).json({ success: false,
        message: 'Voce ja registrou esse voto nesta avaliacao',
        helpful: review.helpful,
        notHelpful: review.notHelpful
      });
    }

    if (existingVote) {
      if (existingVote.helpful) {
        review.helpful = Math.max(0, review.helpful - 1);
      } else {
        review.notHelpful = Math.max(0, review.notHelpful - 1);
      }
      existingVote.helpful = helpful;
      existingVote.votedAt = new Date();
    } else {
      review.helpfulVotes.push({
        userId: req.user.id,
        helpful
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
      return res.status(404).json({ success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Apenas o autor ou admin pode deletar
    if (review.reviewerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false,
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
