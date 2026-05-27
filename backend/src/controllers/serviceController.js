import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';

const STATUS = {
  PENDING: 'pending',
  NEGOTIATING: 'negotiating',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  PENDING_CLIENT_CONFIRMATION: 'pending_client_confirmation',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  DISPUTED: 'disputed'
};

const populateServiceRequest = (query) => query
  .populate('requesterId', 'name email phone avatar clientRating')
  .populate('providerId', 'name email phone avatar category pricePerHour providerRating');

const idsMatch = (left, right) => String(left || '') === String(right || '');

const isProviderFor = (serviceRequest, userId) => idsMatch(serviceRequest.providerId, userId);
const isRequesterFor = (serviceRequest, userId) => idsMatch(serviceRequest.requesterId, userId);

const isParticipantFor = (serviceRequest, userId) =>
  isProviderFor(serviceRequest, userId) || isRequesterFor(serviceRequest, userId);

const normalizePositiveNumber = (value, fieldName, { min = 0, max = 1000000 } = {}) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${fieldName} invalido`);
  }
  return parsed;
};

const normalizeText = (value, fieldName, { min = 1, max = 2000 } = {}) => {
  const text = String(value || '').trim();
  if (text.length < min || text.length > max) {
    throw new Error(`${fieldName} deve ter entre ${min} e ${max} caracteres`);
  }
  return text;
};

const normalizeFutureDate = (value, fieldName) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} invalida`);
  }
  return date;
};

const markRequesterUnread = (serviceRequest) => {
  serviceRequest.requesterStatusViewedAt = null;
  serviceRequest.requesterStatusUnread = true;
};

const applyAcceptedDetails = (serviceRequest) => {
  if (serviceRequest.negotiation?.response === 'accepted') {
    return;
  }

  if (serviceRequest.negotiation?.suggestedDate) {
    serviceRequest.requestedDate = serviceRequest.negotiation.suggestedDate;
  }
  if (serviceRequest.negotiation?.estimatedHours) {
    serviceRequest.estimatedHours = serviceRequest.negotiation.estimatedHours;
  }
  if (serviceRequest.negotiation?.estimatedAmount !== null && serviceRequest.negotiation?.estimatedAmount !== undefined) {
    serviceRequest.estimatedAmount = serviceRequest.negotiation.estimatedAmount;
    serviceRequest.price = serviceRequest.negotiation.estimatedAmount;
  }
};

const updateServiceStatusInternal = async (serviceRequest, status, notes) => {
  serviceRequest.status = status;
  if (notes) serviceRequest.notes = notes;

  if (status === STATUS.ACCEPTED) {
    serviceRequest.acceptedAt = new Date();
    markRequesterUnread(serviceRequest);
  }
  if (status === STATUS.IN_PROGRESS) {
    serviceRequest.startedAt = new Date();
  }
  if (status === STATUS.PENDING_CLIENT_CONFIRMATION) {
    serviceRequest.providerMarkedDoneAt = new Date();
    markRequesterUnread(serviceRequest);
  }
  if (status === STATUS.COMPLETED) {
    serviceRequest.completedAt = new Date();
    serviceRequest.finalAmount = serviceRequest.finalAmount || serviceRequest.estimatedAmount || serviceRequest.price || null;
  }
  if (status === STATUS.CANCELLED) {
    serviceRequest.cancelledAt = new Date();
  }
  if (status === STATUS.REJECTED) {
    serviceRequest.rejectedAt = new Date();
    markRequesterUnread(serviceRequest);
  }
  if (status === STATUS.DISPUTED) {
    serviceRequest.disputedAt = new Date();
    markRequesterUnread(serviceRequest);
  }

  await serviceRequest.save();
};

const getServiceOr404 = async (id, res) => {
  const serviceRequest = await ServiceRequest.findById(id);
  if (!serviceRequest) {
    res.status(404).json({ success: false, message: 'Servico nao encontrado' });
    return null;
  }
  return serviceRequest;
};

// @desc    Criar solicitacao de servico
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

    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';

    if (providerId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Voce nao pode solicitar servico para si mesmo'
      });
    }

    const provider = await User.findById(providerId);
    if (!provider || provider.type !== 'provider' || provider.isActive === false || provider.isDeleted === true) {
      return res.status(404).json({ success: false,
        message: 'Prestador nao encontrado'
      });
    }

    if (!provider.isAvailableAsProvider) {
      return res.status(400).json({ success: false,
        message: 'Prestador nao esta disponivel no momento'
      });
    }

    if (!provider.category || !provider.description || !provider.pricePerHour || provider.pricePerHour <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Prestador ainda nao completou as informacoes profissionais'
      });
    }

    const normalizedEstimatedHours = normalizePositiveNumber(estimatedHours, 'Horas estimadas', { min: 0.5, max: 100 });
    const normalizedRequestedDate = normalizeFutureDate(requestedDate, 'Data desejada');
    const estimatedAmount = Number((provider.pricePerHour * normalizedEstimatedHours).toFixed(2));

    const serviceRequest = await ServiceRequest.create({
      requesterId: req.user.id,
      requesterType: isAdmin ? 'admin' : req.user.type,
      providerId,
      category: provider.category || category,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      requestedDate: normalizedRequestedDate,
      estimatedHours: normalizedEstimatedHours,
      estimatedAmount,
      price: estimatedAmount,
      paymentStatus: 'not_applicable'
    });

    const populatedRequest = await populateServiceRequest(ServiceRequest.findById(serviceRequest._id));

    res.status(201).json({
      success: true,
      serviceRequest: populatedRequest
    });
  } catch (error) {
    console.error('Erro ao criar solicitacao:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao criar solicitacao'
    });
  }
};

// @desc    Obter minhas solicitacoes (como solicitante)
// @route   GET /api/services/my-requests
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { requesterId: req.user.id };
    if (status) query.status = status;

    const requests = await ServiceRequest.find(query)
      .populate('providerId', 'name email phone avatar category providerRating pricePerHour')
      .sort('-createdAt');

    res.json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Erro ao buscar solicitacoes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar solicitacoes'
    });
  }
};

export const markMyRequestResponsesViewed = async (req, res) => {
  try {
    const result = await ServiceRequest.updateMany(
      {
        requesterId: req.user.id,
        status: {
          $in: [
            STATUS.NEGOTIATING,
            STATUS.ACCEPTED,
            STATUS.REJECTED,
            STATUS.PENDING_CLIENT_CONFIRMATION,
            STATUS.DISPUTED
          ]
        },
        requesterStatusUnread: true
      },
      {
        $set: {
          requesterStatusViewedAt: new Date(),
          requesterStatusUnread: false
        }
      }
    );

    res.json({
      success: true,
      modifiedCount: result.modifiedCount || 0
    });
  } catch (error) {
    console.error('Erro ao marcar respostas como vistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar respostas como vistas'
    });
  }
};

// @desc    Obter servicos recebidos (como prestador)
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
    console.error('Erro ao buscar servicos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar servicos'
    });
  }
};

// @desc    Atualizar status de servico
// @route   PUT /api/services/:id/status
// @access  Private
export const updateServiceStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const allowedStatuses = [
      STATUS.ACCEPTED,
      STATUS.REJECTED,
      STATUS.CANCELLED,
      STATUS.IN_PROGRESS,
      STATUS.PENDING_CLIENT_CONFIRMATION,
      STATUS.COMPLETED,
      STATUS.DISPUTED
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status invalido'
      });
    }

    const serviceRequest = await getServiceOr404(req.params.id, res);
    if (!serviceRequest) return;

    const isProvider = isProviderFor(serviceRequest, req.user.id);
    const isRequester = isRequesterFor(serviceRequest, req.user.id);

    if (!isProvider && !isRequester) {
      return res.status(403).json({ success: false,
        message: 'Sem permissao para atualizar este servico'
      });
    }

    if (status === STATUS.ACCEPTED) {
      if (!isProvider) {
        return res.status(403).json({ success: false, message: 'Apenas o prestador pode aceitar diretamente' });
      }
      if (serviceRequest.status !== STATUS.PENDING) {
        return res.status(400).json({ success: false, message: 'Apenas solicitacoes pendentes podem ser aceitas diretamente' });
      }
    }

    if (status === STATUS.REJECTED) {
      if (!isProvider) {
        return res.status(403).json({ success: false, message: 'Apenas o prestador pode recusar' });
      }
      if (![STATUS.PENDING, STATUS.NEGOTIATING].includes(serviceRequest.status)) {
        return res.status(400).json({ success: false, message: 'Apenas solicitacoes pendentes ou em negociacao podem ser recusadas' });
      }
    }

    if (status === STATUS.CANCELLED) {
      if (!isRequester) {
        return res.status(403).json({ success: false, message: 'Apenas o solicitante pode cancelar' });
      }
      if (![STATUS.PENDING, STATUS.NEGOTIATING, STATUS.ACCEPTED].includes(serviceRequest.status)) {
        return res.status(400).json({ success: false, message: 'Este servico nao pode mais ser cancelado por esta acao' });
      }
      if (serviceRequest.status === STATUS.NEGOTIATING && serviceRequest.negotiation) {
        serviceRequest.negotiation.response = 'cancelled';
        serviceRequest.negotiation.respondedAt = new Date();
      }
    }

    if (status === STATUS.IN_PROGRESS) {
      if (!isProvider) {
        return res.status(403).json({ success: false, message: 'Apenas o prestador pode iniciar o servico' });
      }
      if (serviceRequest.status !== STATUS.ACCEPTED) {
        return res.status(400).json({ success: false, message: 'Apenas servicos aceitos podem ser iniciados' });
      }
    }

    if (status === STATUS.PENDING_CLIENT_CONFIRMATION) {
      if (!isProvider) {
        return res.status(403).json({ success: false, message: 'Apenas o prestador pode marcar como realizado' });
      }
      if (serviceRequest.status !== STATUS.IN_PROGRESS) {
        return res.status(400).json({ success: false, message: 'Apenas servicos em andamento podem ser marcados como realizados' });
      }
    }

    if (status === STATUS.COMPLETED) {
      if (!isRequester) {
        return res.status(403).json({ success: false, message: 'Apenas o cliente pode confirmar a conclusao' });
      }
      if (serviceRequest.status !== STATUS.PENDING_CLIENT_CONFIRMATION) {
        return res.status(400).json({ success: false, message: 'Apenas servicos aguardando confirmacao podem ser concluidos' });
      }
    }

    if (status === STATUS.DISPUTED) {
      return res.status(400).json({ success: false, message: 'Use a rota de disputa para contestar o servico' });
    }

    await updateServiceStatusInternal(serviceRequest, status, notes);

    const updatedRequest = await populateServiceRequest(ServiceRequest.findById(serviceRequest._id));

    res.json({
      success: true,
      serviceRequest: updatedRequest
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao atualizar status'
    });
  }
};

// @desc    Prestador sugere alteracao
// @route   POST /api/services/:id/suggest-change
// @access  Private
export const suggestServiceChange = async (req, res) => {
  try {
    const { requestedDate, estimatedHours, message, estimatedAmount } = req.body;
    const serviceRequest = await getServiceOr404(req.params.id, res);
    if (!serviceRequest) return;

    if (!isProviderFor(serviceRequest, req.user.id)) {
      return res.status(403).json({ success: false, message: 'Apenas o prestador pode sugerir alteracao' });
    }

    if (![STATUS.PENDING, STATUS.NEGOTIATING].includes(serviceRequest.status)) {
      return res.status(400).json({ success: false, message: 'Apenas solicitacoes pendentes ou em negociacao podem receber sugestao' });
    }

    const suggestion = {
      suggestedDate: requestedDate ? normalizeFutureDate(requestedDate, 'Nova data') : serviceRequest.requestedDate,
      estimatedHours: estimatedHours !== undefined
        ? normalizePositiveNumber(estimatedHours, 'Horas estimadas', { min: 0.5, max: 100 })
        : serviceRequest.estimatedHours,
      estimatedAmount: estimatedAmount !== undefined && estimatedAmount !== ''
        ? normalizePositiveNumber(estimatedAmount, 'Valor estimado', { min: 0, max: 1000000 })
        : null,
      message: normalizeText(message, 'Mensagem', { min: 5, max: 1000 }),
      suggestedBy: req.user.id,
      suggestedAt: new Date(),
      respondedAt: null,
      response: 'pending'
    };

    serviceRequest.negotiation = suggestion;
    serviceRequest.status = STATUS.NEGOTIATING;
    markRequesterUnread(serviceRequest);
    await serviceRequest.save();

    const updatedRequest = await populateServiceRequest(ServiceRequest.findById(serviceRequest._id));

    res.json({
      success: true,
      serviceRequest: updatedRequest
    });
  } catch (error) {
    console.error('Erro ao sugerir alteracao:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao sugerir alteracao'
    });
  }
};

// @desc    Cliente responde negociacao
// @route   PUT /api/services/:id/negotiation
// @access  Private
export const respondToNegotiation = async (req, res) => {
  try {
    const { action, notes } = req.body;
    const serviceRequest = await getServiceOr404(req.params.id, res);
    if (!serviceRequest) return;

    if (!isRequesterFor(serviceRequest, req.user.id)) {
      return res.status(403).json({ success: false, message: 'Apenas o solicitante pode responder a negociacao' });
    }

    if (serviceRequest.status !== STATUS.NEGOTIATING || serviceRequest.negotiation?.response !== 'pending') {
      return res.status(400).json({ success: false, message: 'Nao ha negociacao pendente para responder' });
    }

    if (action === 'accept') {
      applyAcceptedDetails(serviceRequest);
      serviceRequest.negotiation.response = 'accepted';
      serviceRequest.negotiation.respondedAt = new Date();
      await updateServiceStatusInternal(serviceRequest, STATUS.ACCEPTED, notes);
    } else if (action === 'cancel') {
      serviceRequest.negotiation.response = 'cancelled';
      serviceRequest.negotiation.respondedAt = new Date();
      await updateServiceStatusInternal(serviceRequest, STATUS.CANCELLED, notes);
    } else {
      return res.status(400).json({ success: false, message: 'Acao de negociacao invalida' });
    }

    const updatedRequest = await populateServiceRequest(ServiceRequest.findById(serviceRequest._id));

    res.json({
      success: true,
      serviceRequest: updatedRequest
    });
  } catch (error) {
    console.error('Erro ao responder negociacao:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao responder negociacao'
    });
  }
};

// @desc    Cliente abre disputa
// @route   POST /api/services/:id/dispute
// @access  Private
export const openServiceDispute = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const serviceRequest = await getServiceOr404(req.params.id, res);
    if (!serviceRequest) return;

    if (!isRequesterFor(serviceRequest, req.user.id)) {
      return res.status(403).json({ success: false, message: 'Apenas o cliente pode abrir disputa' });
    }

    if (serviceRequest.status !== STATUS.PENDING_CLIENT_CONFIRMATION) {
      return res.status(400).json({ success: false, message: 'Disputa so pode ser aberta durante a confirmacao do cliente' });
    }

    serviceRequest.disputes.push({
      reason: normalizeText(reason, 'Motivo', { min: 3, max: 120 }),
      description: normalizeText(description, 'Descricao', { min: 10, max: 2000 }),
      openedBy: req.user.id,
      openedAt: new Date(),
      status: 'open'
    });

    await updateServiceStatusInternal(serviceRequest, STATUS.DISPUTED);

    const updatedRequest = await populateServiceRequest(ServiceRequest.findById(serviceRequest._id));

    res.json({
      success: true,
      serviceRequest: updatedRequest
    });
  } catch (error) {
    console.error('Erro ao abrir disputa:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao abrir disputa'
    });
  }
};

// @desc    Listar disputas de um servico
// @route   GET /api/services/:id/disputes
// @access  Private
export const getServiceDisputes = async (req, res) => {
  try {
    const serviceRequest = await getServiceOr404(req.params.id, res);
    if (!serviceRequest) return;

    if (!isParticipantFor(serviceRequest, req.user.id) && req.user.role !== 'admin' && req.user.type !== 'admin') {
      return res.status(403).json({ success: false, message: 'Sem permissao para ver disputas deste servico' });
    }

    res.json({
      success: true,
      disputes: serviceRequest.disputes || []
    });
  } catch (error) {
    console.error('Erro ao buscar disputas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar disputas'
    });
  }
};

// @desc    Avaliar servico (compatibilidade)
// @route   POST /api/services/:id/review
// @access  Private
export const reviewService = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Use /api/reviews com serviceId para avaliar servicos concluidos'
  });
};
