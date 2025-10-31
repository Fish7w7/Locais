// SERVICE REQUEST CONTROLLER

const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

// @desc    Criar nova solicitação de serviço
// @route   POST /api/requests
// @access  Private (Client, Provider, Company)
exports.createRequest = async (req, res) => {
  try {
    const {
      providerId,
      category,
      title,
      description,
      location,
      requestedDate,
      estimatedDuration,
      price
    } = req.body;

    // Verificar se prestador existe e é do tipo provider
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Prestador não encontrado'
      });
    }

    if (provider.userType !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'Usuário não é um prestador'
      });
    }

    // Verificar se prestador está disponível
    if (!provider.isAvailableAsProvider) {
      return res.status(400).json({
        success: false,
        message: 'Prestador não está disponível no momento'
      });
    }

    // Criar solicitação
    const request = await ServiceRequest.create({
      requester: req.user.id,
      requesterType: req.user.userType,
      provider: providerId,
      category,
      title,
      description,
      location,
      requestedDate,
      estimatedDuration,
      price
    });

    // Popular dados do prestador e solicitante
    await request.populate('requester', 'name email phone avatar');
    await request.populate('provider', 'name email phone avatar category pricePerHour providerRating');

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar todas as solicitações do usuário logado
// @route   GET /api/requests
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};

    // Se for prestador, busca solicitações recebidas
    if (req.user.userType === 'provider') {
      query.provider = req.user.id;
    } 
    // Se for cliente/empresa, busca solicitações feitas
    else {
      query.requester = req.user.id;
    }

    // Filtrar por status se fornecido
    if (status) {
      query.status = status;
    }

    const requests = await ServiceRequest.find(query)
      .populate('requester', 'name email phone avatar userType')
      .populate('provider', 'name email phone avatar category pricePerHour providerRating')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ServiceRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: requests
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Buscar solicitação específica por ID
// @route   GET /api/requests/:id
// @access  Private
exports.getRequestById = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id)
      .populate('requester', 'name email phone avatar userType companyDescription')
      .populate('provider', 'name email phone avatar category pricePerHour providerRating bio');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    // Verificar se usuário tem permissão para ver
    const isRequester = request.requester._id.toString() === req.user.id;
    const isProvider = request.provider._id.toString() === req.user.id;

    if (!isRequester && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para ver esta solicitação'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Aceitar solicitação (PRESTADOR)
// @route   PUT /api/requests/:id/accept
// @access  Private (Provider only)
exports.acceptRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    // Verificar se é o prestador
    if (request.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o prestador pode aceitar'
      });
    }

    // Verificar se status permite aceitar
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Não é possível aceitar solicitação com status: ${request.status}`
      });
    }

    // Aceitar com preço negociado (opcional)
    request.status = 'accepted';
    if (req.body.negotiatedPrice) {
      request.negotiatedPrice = req.body.negotiatedPrice;
    }

    await request.save();
    await request.populate('requester', 'name email phone');
    await request.populate('provider', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Solicitação aceita com sucesso',
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Rejeitar solicitação (PRESTADOR)
// @route   PUT /api/requests/:id/reject
// @access  Private (Provider only)
exports.rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    if (request.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o prestador pode rejeitar'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Apenas solicitações pendentes podem ser rejeitadas'
      });
    }

    request.status = 'rejected';
    request.rejectionReason = reason;

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Solicitação rejeitada',
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Iniciar trabalho (PRESTADOR)
// @route   PUT /api/requests/:id/start
// @access  Private (Provider only)
exports.startWork = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    if (request.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o prestador pode iniciar o trabalho'
      });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Solicitação precisa estar aceita'
      });
    }

    request.status = 'in_progress';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Trabalho iniciado',
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Concluir trabalho (PRESTADOR)
// @route   PUT /api/requests/:id/complete
// @access  Private (Provider only)
exports.completeWork = async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    if (request.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o prestador pode concluir o trabalho'
      });
    }

    if (request.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Trabalho precisa estar em andamento'
      });
    }

    request.status = 'completed';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Trabalho concluído com sucesso',
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancelar solicitação
// @route   PUT /api/requests/:id/cancel
// @access  Private (Requester or Provider)
exports.cancelRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    const isRequester = request.requester.toString() === req.user.id;
    const isProvider = request.provider.toString() === req.user.id;

    if (!isRequester && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para cancelar'
      });
    }

    // Não permitir cancelar se já concluído
    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar trabalho concluído'
      });
    }

    request.status = 'cancelled';
    request.cancellationReason = reason;
    request.cancelledBy = req.user.id;

    await request.save();

    res.status(200).json({
      success: true,
      message: 'Solicitação cancelada',
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Avaliar prestador (CLIENTE/EMPRESA)
// @route   PUT /api/requests/:id/review-provider
// @access  Private (Requester only)
exports.reviewProvider = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Apenas quem solicitou pode avaliar'
      });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Apenas trabalhos concluídos podem ser avaliados'
      });
    }

    if (request.providerRating && request.providerRating.rating) {
      return res.status(400).json({
        success: false,
        message: 'Prestador já foi avaliado'
      });
    }

    request.providerRating = {
      rating,
      review,
      reviewedAt: new Date()
    };

    await request.save();

    // Atualizar rating do prestador
    await updateProviderRating(request.provider);

    res.status(200).json({
      success: true,
      message: 'Avaliação enviada com sucesso',
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Avaliar cliente (PRESTADOR)
// @route   PUT /api/requests/:id/review-client
// @access  Private (Provider only)
exports.reviewClient = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Solicitação não encontrada'
      });
    }

    if (request.provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Apenas o prestador pode avaliar'
      });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Apenas trabalhos concluídos podem ser avaliados'
      });
    }

    if (request.clientRating && request.clientRating.rating) {
      return res.status(400).json({
        success: false,
        message: 'Cliente já foi avaliado'
      });
    }

    request.clientRating = {
      rating,
      review,
      reviewedAt: new Date()
    };

    await request.save();

    // Atualizar rating do cliente
    await updateClientRating(request.requester);

    res.status(200).json({
      success: true,
      message: 'Avaliação enviada com sucesso',
      data: request
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Função auxiliar para atualizar rating do prestador
async function updateProviderRating(providerId) {
  const requests = await ServiceRequest.find({
    provider: providerId,
    'providerRating.rating': { $exists: true }
  });

  if (requests.length > 0) {
    const totalRating = requests.reduce((sum, req) => sum + req.providerRating.rating, 0);
    const avgRating = totalRating / requests.length;

    await User.findByIdAndUpdate(providerId, {
      providerRating: parseFloat(avgRating.toFixed(1)),
      providerReviewCount: requests.length
    });
  }
}

// Função auxiliar para atualizar rating do cliente
async function updateClientRating(clientId) {
  const requests = await ServiceRequest.find({
    requester: clientId,
    'clientRating.rating': { $exists: true }
  });

  if (requests.length > 0) {
    const totalRating = requests.reduce((sum, req) => sum + req.clientRating.rating, 0);
    const avgRating = totalRating / requests.length;

    await User.findByIdAndUpdate(clientId, {
      clientRating: parseFloat(avgRating.toFixed(1)),
      clientReviewCount: requests.length
    });
  }
}