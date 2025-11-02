import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';

// @desc    Criar solicitação de serviço
// @route   POST /api/services
// @access  Private
export const createServiceRequest = async (req, res) => {
  try {
    const {
      providerId,
      category,
      title,
      description,
      location,
      requestedDate,
      estimatedHours
    } = req.body;

    // Verificar se o prestador existe
    const provider = await User.findById(providerId);
    if (!provider || provider.type !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'Prestador não encontrado'
      });
    }

    // Verificar se o prestador está disponível
    if (!provider.isAvailableAsProvider) {
      return res.status(400).json({
        success: false,
        message: 'Prestador não está disponível no momento'
      });
    }

    const serviceRequest = await ServiceRequest.create({
      requesterId: req.user.id,
      requesterType: req.user.type,
      providerId,
      category,
      title,
      description,
      location,
      requestedDate,
      estimatedHours,
      price: estimatedHours ? provider.pricePerHour * estimatedHours : null
    });

    const populatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('requesterId', 'name email phone avatar')
      .populate('providerId', 'name email phone avatar category pricePerHour');

    res.status(201).json({
      success: true,
      serviceRequest: populatedRequest
    });
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar solicitação',
      error: error.message
    });
  }
};

// @desc    Obter minhas solicitações (como solicitante)
// @route   GET /api/services/my-requests
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { requesterId: req.user.id };
    if (status) query.status = status;

    const requests = await ServiceRequest.find(query)
      .populate('providerId', 'name email phone avatar category providerRating')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Erro ao buscar solicitações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar solicitações',
      error: error.message
    });
  }
};

// @desc    Obter serviços recebidos (como prestador)
// @route   GET /api/services/received
// @access  Private (apenas prestadores)
export const getReceivedServices = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { providerId: req.user.id };
    if (status) query.status = status;

    const services = await ServiceRequest.find(query)
      .populate('requesterId', 'name email phone avatar clientRating')
      .sort('-createdAt');

    res.json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar serviços',
      error: error.message
    });
  }
};

// @desc    Atualizar status de serviço
// @route   PUT /api/services/:id/status
// @access  Private
export const updateServiceStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    // Verificar permissão
    const isProvider = serviceRequest.providerId.toString() === req.user.id;
    const isRequester = serviceRequest.requesterId.toString() === req.user.id;

    if (!isProvider && !isRequester) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para atualizar este serviço'
      });
    }

    // Regras de transição de status
    if (status === 'accepted' || status === 'rejected') {
      if (!isProvider) {
        return res.status(403).json({
          success: false,
          message: 'Apenas o prestador pode aceitar ou rejeitar'
        });
      }
    }

    if (status === 'cancelled') {
      if (!isRequester && serviceRequest.status === 'pending') {
        return res.status(403).json({
          success: false,
          message: 'Apenas o solicitante pode cancelar solicitações pendentes'
        });
      }
    }

    serviceRequest.status = status;
    if (notes) serviceRequest.notes = notes;

    if (status === 'completed') {
      serviceRequest.completedAt = new Date();
    }

    await serviceRequest.save();

    const updatedRequest = await ServiceRequest.findById(serviceRequest._id)
      .populate('requesterId', 'name email phone avatar')
      .populate('providerId', 'name email phone avatar category');

    res.json({
      success: true,
      serviceRequest: updatedRequest
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status',
      error: error.message
    });
  }
};

// @desc    Avaliar serviço
// @route   POST /api/services/:id/review
// @access  Private
export const reviewService = async (req, res) => {
  try {
    const { rating, review, type } = req.body; // type: 'provider' ou 'client'
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Avaliação deve ser entre 1 e 5'
      });
    }

    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Serviço não encontrado'
      });
    }

    if (serviceRequest.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Apenas serviços concluídos podem ser avaliados'
      });
    }

    const isProvider = serviceRequest.providerId.toString() === req.user.id;
    const isRequester = serviceRequest.requesterId.toString() === req.user.id;

    // Prestador avalia o cliente
    if (type === 'client' && isProvider) {
      if (serviceRequest.clientRating) {
        return res.status(400).json({
          success: false,
          message: 'Cliente já foi avaliado'
        });
      }

      serviceRequest.clientRating = rating;
      serviceRequest.clientReview = review;

      // Atualizar rating do cliente
      const client = await User.findById(serviceRequest.requesterId);
      const totalRating = (client.clientRating * client.clientReviewCount) + rating;
      client.clientReviewCount += 1;
      client.clientRating = totalRating / client.clientReviewCount;
      await client.save();
    }
    // Cliente avalia o prestador
    else if (type === 'provider' && isRequester) {
      if (serviceRequest.providerRating) {
        return res.status(400).json({
          success: false,
          message: 'Prestador já foi avaliado'
        });
      }

      serviceRequest.providerRating = rating;
      serviceRequest.providerReview = review;

      // Atualizar rating do prestador
      const provider = await User.findById(serviceRequest.providerId);
      const totalRating = (provider.providerRating * provider.providerReviewCount) + rating;
      provider.providerReviewCount += 1;
      provider.providerRating = totalRating / provider.providerReviewCount;
      await provider.save();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para avaliar'
      });
    }

    await serviceRequest.save();

    res.json({
      success: true,
      message: 'Avaliação registrada com sucesso',
      serviceRequest
    });
  } catch (error) {
    console.error('Erro ao avaliar serviço:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao avaliar serviço',
      error: error.message
    });
  }
};