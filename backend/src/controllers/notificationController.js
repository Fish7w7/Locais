import Application from '../models/Application.js';
import Conversation from '../models/Conversation.js';
import JobProposal from '../models/JobProposal.js';
import JobVacancy from '../models/JobVacancy.js';
import ServiceRequest from '../models/ServiceRequest.js';

export const getNotificationSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.type;

    const chatConversations = await Conversation.find({ participants: userId,
      isActive: true
    })
      .select('unreadCount')
      .lean();

    const chatUnread = chatConversations.reduce((total, conversation) => {
      return total + Number(conversation.unreadCount?.[userId] || 0);
    }, 0);

    let pendingServices = 0;
    let pendingProposals = 0;
    let pendingApplications = 0;

    if (userType === 'provider') {
      [pendingServices, pendingProposals] = await Promise.all([
        ServiceRequest.countDocuments({ providerId: userId, status: 'pending' }),
        JobProposal.countDocuments({ providerId: userId, status: 'pending' })
      ]);
    }

    if (userType === 'company') {
      const companyJobs = await JobVacancy.find({ companyId: userId })
        .select('_id')
        .lean();

      const jobIds = companyJobs.map((job) => job._id);
      pendingApplications = jobIds.length
        ? await Application.countDocuments({ jobId: { $in: jobIds }, status: 'pending' })
        : 0;
    }

    res.json({
      success: true,
      notifications: {
        chatUnread,
        pendingServices,
        pendingProposals,
        pendingApplications,
        services: pendingServices,
        jobs: pendingProposals + pendingApplications,
        total: chatUnread + pendingServices + pendingProposals + pendingApplications
      }
    });
  } catch (error) {
    console.error('Erro ao buscar resumo de notificações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar notificações',
      error: error.message
    });
  }
};
