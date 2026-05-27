// backend/src/controllers/chatController.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const idsMatch = (left, right) => String(left || '') === String(right || '');

const isParticipant = (conversation, userId) =>
  conversation.participants.some((participantId) => idsMatch(participantId, userId));

const getUnreadCount = (unreadCount, userId) => {
  if (!unreadCount) return 0;
  if (typeof unreadCount.get === 'function') {
    return Number(unreadCount.get(String(userId)) || 0);
  }
  return Number(unreadCount[String(userId)] || 0);
};

const formatConversationForUser = (conversation, userId) => {
  const conv = typeof conversation.toObject === 'function'
    ? conversation.toObject()
    : conversation;

  const otherUser = conv.participants?.find((participant) =>
    !idsMatch(participant?._id || participant, userId)
  ) || null;

  const hasLastMessage = conv.lastMessage?.content || conv.lastMessage?.timestamp;

  return {
    ...conv,
    otherUser,
    lastMessage: hasLastMessage
      ? conv.lastMessage
      : {
          content: 'Conversa iniciada',
          sender: null,
          timestamp: conv.updatedAt || conv.createdAt || null
        },
    unreadCount: getUnreadCount(conv.unreadCount, userId)
  };
};

// @desc    Criar ou obter conversa
// @route   POST /api/chat/conversation
// @access  Private
export const createOrGetConversation = async (req, res) => {
  try {
    const { otherUserId, type, relatedId } = req.body;
    const currentUserId = req.user.id;

    if (!isValidObjectId(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Usuário da conversa inválido'
      });
    }

    if (!['service', 'job_application', 'job_proposal'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de conversa inválido'
      });
    }

    if (!isValidObjectId(relatedId)) {
      return res.status(400).json({
        success: false,
        message: 'Referência da conversa inválida'
      });
    }

    if (idsMatch(currentUserId, otherUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível iniciar conversa consigo mesmo'
      });
    }

    const relatedObjectId = new mongoose.Types.ObjectId(relatedId);

    // Verificar permissões baseado no tipo
    const hasPermission = await checkConversationPermission(
      currentUserId,
      otherUserId,
      type,
      relatedId
    );

    if (!hasPermission.allowed) {
      return res.status(403).json({ success: false,
        message: hasPermission.reason
      });
    }

    // Buscar conversa existente
    let conversation = await Conversation.findOne({ participants: { $all: [currentUserId, otherUserId] },
      type,
      ...(type === 'service' && relatedObjectId && { relatedService: relatedObjectId }),
      ...(type === 'job_application' && relatedObjectId && { relatedApplication: relatedObjectId }),
      ...(type === 'job_proposal' && relatedObjectId && { relatedProposal: relatedObjectId })
    }).populate('participants', 'name avatar type');

    // Se não existir, criar nova
    if (!conversation) {
      const conversationData = { participants: [currentUserId, otherUserId],
        type,
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0
        }
      };

      if (type === 'service') conversationData.relatedService = relatedObjectId;
      if (type === 'job_application') conversationData.relatedApplication = relatedObjectId;
      if (type === 'job_proposal') conversationData.relatedProposal = relatedObjectId;

      conversation = await Conversation.create(conversationData);
      conversation = await conversation.populate('participants', 'name avatar type');

      const systemMessage = await Message.create({
        conversationId: conversation._id,
        sender: currentUserId,
        content: 'Conversa iniciada',
        messageType: 'system'
      });

      conversation.lastMessage = {
        content: systemMessage.content,
        sender: currentUserId,
        timestamp: systemMessage.createdAt
      };
      await conversation.save();
    }

    res.json({
      success: true,
      conversation: formatConversationForUser(conversation, currentUserId)
    });
  } catch (error) {
    console.error('Erro ao criar/obter conversa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar conversa',
      error: error.message
    });
  }
};

// @desc    Listar minhas conversas
// @route   GET /api/chat/conversations
// @access  Private
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name avatar type')
      .populate('lastMessage.sender', 'name')
      .sort('-lastMessage.timestamp')
      .lean();

    const formattedConversations = conversations.map((conversation) =>
      formatConversationForUser(conversation, req.user.id)
    );

    res.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar conversas',
      error: error.message
    });
  }
};

// @desc    Obter mensagens de uma conversa
// @route   GET /api/chat/conversations/:id/messages
// @access  Private
export const getConversationMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, before } = req.query;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Conversa inválida'
      });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false,
        message: 'Conversa não encontrada'
      });
    }

    if (!isParticipant(conversation, req.user.id)) {
      return res.status(403).json({ success: false,
        message: 'Você não tem acesso a esta conversa'
      });
    }

    const query = { conversationId: id };
    if (before) query.createdAt = { $lt: before };

    const messages = await Message.find(query)
      .populate('sender', 'name avatar')
      .sort('-createdAt')
      .limit(parseInt(limit));

    await Message.updateMany(
      {
        conversationId: id,
        sender: { $ne: req.user.id },
        'readBy.userId': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            userId: req.user.id,
            readAt: new Date()
          }
        }
      }
    );

    await Conversation.findByIdAndUpdate(id, {
      [`unreadCount.${req.user.id}`]: 0
    });

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar mensagens',
      error: error.message
    });
  }
};

// @desc    Enviar mensagem
// @route   POST /api/chat/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false,
        message: 'Mensagem não pode estar vazia'
      });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem deve ter no máximo 1000 caracteres'
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Conversa inválida'
      });
    }

    // Verificar se é participante
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false,
        message: 'Conversa não encontrada'
      });
    }

    if (!isParticipant(conversation, req.user.id)) {
      return res.status(403).json({ success: false,
        message: 'Você não tem acesso a esta conversa'
      });
    }

    // Criar mensagem
    const message = await Message.create({ conversationId: id,
      sender: req.user.id,
      content: content.trim(),
      readBy: [{
        userId: req.user.id,
        readAt: new Date()
      }]
    });

    await message.populate('sender', 'name avatar');

    const updateData = { lastMessage: {
        content: content.trim(),
        sender: req.user.id,
        timestamp: new Date()
      }
    };

    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const currentCount = getUnreadCount(conversation.unreadCount, participantId);
        updateData[`unreadCount.${participantId}`] = currentCount + 1;
      }
    });

    await Conversation.findByIdAndUpdate(id, updateData);

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem',
      error: error.message
    });
  }
};

async function checkConversationPermission(currentUserId, otherUserId, type, relatedId) {
  try {
    if (type === 'service') {
      const service = await ServiceRequest.findById(relatedId);
      if (!service) { 
        return { allowed: false, reason: 'Serviço não encontrado' };
      }

      const isRequester = idsMatch(service.requesterId, currentUserId);
      const isProvider = idsMatch(service.providerId, currentUserId);
      const isOtherRequester = idsMatch(service.requesterId, otherUserId);
      const isOtherProvider = idsMatch(service.providerId, otherUserId);

      if ((!isRequester && !isProvider) || (!isOtherRequester && !isOtherProvider)) {
        return { allowed: false, reason: 'Você não está envolvido neste serviço' };
      }

      if ((isRequester && !isOtherProvider) || (isProvider && !isOtherRequester)) {
        return { allowed: false, reason: 'Usuário não faz parte deste serviço' };
      }

      const chatEnabledStatuses = [
        'negotiating',
        'accepted',
        'in_progress',
        'pending_client_confirmation',
        'disputed'
      ];

      if (!chatEnabledStatuses.includes(service.status)) {
        return { allowed: false, reason: 'Chat disponivel apenas durante negociacao, execucao, confirmacao ou disputa' };
      }

      return { allowed: true };
    }

    if (type === 'job_application') {
      const application = await Application.findById(relatedId)
        .populate('jobId');
      
      if (!application) {
        return { allowed: false, reason: 'Candidatura não encontrada' };
      }

      const isCompany = idsMatch(application.jobId?.companyId, currentUserId);
      const isApplicant = idsMatch(application.applicantId, currentUserId);
      const isOtherCompany = idsMatch(application.jobId?.companyId, otherUserId);
      const isOtherApplicant = idsMatch(application.applicantId, otherUserId);

      if ((!isCompany && !isApplicant) || (!isOtherCompany && !isOtherApplicant)) {
        return { allowed: false, reason: 'Você não está envolvido nesta candidatura' };
      }

      if ((isCompany && !isOtherApplicant) || (isApplicant && !isOtherCompany)) {
        return { allowed: false, reason: 'Usuário não faz parte desta candidatura' };
      }

      if (!isCompany && application.status === 'pending') {
        return { allowed: false, reason: 'Aguarde resposta da empresa' };
      }

      return { allowed: true };
    }

    if (type === 'job_proposal') {
      const proposal = await JobProposal.findById(relatedId);
      if (!proposal) {
        return { allowed: false, reason: 'Proposta não encontrada' };
      }

      const isCompany = idsMatch(proposal.companyId, currentUserId);
      const isProvider = idsMatch(proposal.providerId, currentUserId);
      const isOtherCompany = idsMatch(proposal.companyId, otherUserId);
      const isOtherProvider = idsMatch(proposal.providerId, otherUserId);

      if ((!isCompany && !isProvider) || (!isOtherCompany && !isOtherProvider)) {
        return { allowed: false, reason: 'Você não está envolvido nesta proposta' };
      }

      if ((isCompany && !isOtherProvider) || (isProvider && !isOtherCompany)) {
        return { allowed: false, reason: 'Usuário não faz parte desta proposta' };
      }

      return { allowed: true };
    }

    return { allowed: false, reason: 'Tipo de conversa inválido' };
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return { allowed: false, reason: 'Erro ao verificar permissões' };
  }
}
