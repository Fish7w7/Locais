// backend/src/controllers/chatController.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';

// @desc    Criar ou obter conversa
// @route   POST /api/chat/conversation
// @access  Private
export const createOrGetConversation = async (req, res) => {
  try {
    const { otherUserId, type, relatedId } = req.body;
    const currentUserId = req.user.id;

    // Verificar permissões baseado no tipo
    const hasPermission = await checkConversationPermission(
      currentUserId,
      otherUserId,
      type,
      relatedId
    );

    if (!hasPermission.allowed) {
      return res.status(403).json({
        success: false,
        message: hasPermission.reason
      });
    }

    // Buscar conversa existente
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] },
      type,
      ...(type === 'service' && { relatedService: relatedId }),
      ...(type === 'job_application' && { relatedApplication: relatedId }),
      ...(type === 'job_proposal' && { relatedProposal: relatedId })
    }).populate('participants', 'name avatar type');

    // Se não existir, criar nova
    if (!conversation) {
      const conversationData = {
        participants: [currentUserId, otherUserId],
        type,
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0
        }
      };

      if (type === 'service') conversationData.relatedService = relatedId;
      if (type === 'job_application') conversationData.relatedApplication = relatedId;
      if (type === 'job_proposal') conversationData.relatedProposal = relatedId;

      conversation = await Conversation.create(conversationData);
      conversation = await conversation.populate('participants', 'name avatar type');

      await Message.create({
        conversationId: conversation._id,
        sender: currentUserId,
        content: 'Conversa iniciada',
        messageType: 'system'
      });
    }

    res.json({
      success: true,
      conversation
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
    const conversations = await Conversation.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name avatar type')
      .populate('lastMessage.sender', 'name')
      .sort('-lastMessage.timestamp')
      .lean();

    // Formatar dados
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(
        p => p._id.toString() !== req.user.id
      );

      return {
        ...conv,
        otherUser,
        unreadCount: conv.unreadCount?.get(req.user.id) || 0
      };
    });

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

    // Verificar se é participante
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversa não encontrada'
      });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
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
      return res.status(400).json({
        success: false,
        message: 'Mensagem não pode estar vazia'
      });
    }

    // Verificar se é participante
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversa não encontrada'
      });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem acesso a esta conversa'
      });
    }

    // Criar mensagem
    const message = await Message.create({
      conversationId: id,
      sender: req.user.id,
      content: content.trim(),
      readBy: [{
        userId: req.user.id,
        readAt: new Date()
      }]
    });

    await message.populate('sender', 'name avatar');

    const updateData = {
      lastMessage: {
        content: content.trim(),
        sender: req.user.id,
        timestamp: new Date()
      }
    };

    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id) {
        const currentCount = conversation.unreadCount?.get(participantId.toString()) || 0;
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

      const isRequester = service.requesterId.toString() === currentUserId;
      const isProvider = service.providerId.toString() === currentUserId;

      if (!isRequester && !isProvider) {
        return { allowed: false, reason: 'Você não está envolvido neste serviço' };
      }

      // Só pode conversar se o serviço foi aceito
      if (service.status === 'pending' || service.status === 'rejected') {
        return { allowed: false, reason: 'Serviço precisa ser aceito primeiro' };
      }

      return { allowed: true };
    }

    if (type === 'job_application') {
      const application = await Application.findById(relatedId)
        .populate('jobId');
      
      if (!application) {
        return { allowed: false, reason: 'Candidatura não encontrada' };
      }

      const isCompany = application.jobId.companyId.toString() === currentUserId;
      const isApplicant = application.applicantId.toString() === currentUserId;

      if (!isCompany && !isApplicant) {
        return { allowed: false, reason: 'Você não está envolvido nesta candidatura' };
      }

      // Empresa sempre pode iniciar, candidato só depois que empresa responder
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

      const isCompany = proposal.companyId.toString() === currentUserId;
      const isProvider = proposal.providerId.toString() === currentUserId;

      if (!isCompany && !isProvider) {
        return { allowed: false, reason: 'Você não está envolvido nesta proposta' };
      }

      return { allowed: true };
    }

    return { allowed: false, reason: 'Tipo de conversa inválido' };
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return { allowed: false, reason: 'Erro ao verificar permissões' };
  }
}