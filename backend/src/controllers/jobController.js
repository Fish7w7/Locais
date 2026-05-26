import JobVacancy from '../models/JobVacancy.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';
import User from '../models/User.js';

// @desc    Criar vaga
// @route   POST /api/jobs
// @access  Private (apenas empresas)
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      salary,
      salaryType,
      location,
      requirements,
      benefits,
      workSchedule,
      startDate,
      endDate,
      vacancies
    } = req.body;

    const normalizedSalary = salary ? Number(salary) : null;
    const normalizedVacancies = Number(vacancies || 1);

    const job = await JobVacancy.create({ companyId: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      type,
      salary: normalizedSalary,
      salaryType,
      location: location.trim(),
      requirements,
      benefits,
      workSchedule: workSchedule?.trim() || null,
      startDate,
      endDate,
      vacancies: normalizedVacancies
    });

    const populatedJob = await JobVacancy.findById(job._id)
      .populate('companyId', 'name email phone avatar companyDescription');

    res.status(201).json({
      success: true,
      job: populatedJob
    });
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar vaga',
      error: error.message
    });
  }
};

// @desc    Listar vagas ativas
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const { category, type, city } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (type) query.type = type;
    if (city) query.location = { $regex: city, $options: 'i' };

    const jobs = await JobVacancy.find(query)
      .populate('companyId', 'name avatar companyDescription')
      .sort('-createdAt');

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar vagas',
      error: error.message
    });
  }
};

// @desc    Listar minhas vagas/publicações
// @route   GET /api/jobs/my-jobs
// @access  Private (empresas/admin)
export const getMyCompanyJobs = async (req, res) => {
  try {
    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const query = isAdmin ? {} : { companyId: req.user.id };

    const jobs = await JobVacancy.find(query)
      .populate('companyId', 'name avatar companyDescription')
      .sort('-createdAt');

    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Erro ao buscar minhas vagas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar minhas vagas',
      error: error.message
    });
  }
};

// @desc    Obter vaga por ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id)
      .populate('companyId', 'name email phone avatar companyDescription');

    if (!job) {
      return res.status(404).json({ success: false,
        message: 'Vaga não encontrada'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar vaga',
      error: error.message
    });
  }
};

// @desc    Atualizar vaga
// @route   PUT /api/jobs/:id
// @access  Private (apenas empresa dona da vaga OU admin)
export const updateJob = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false,
        message: 'Vaga não encontrada'
      });
    }

    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const isOwner = job.companyId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false,
        message: 'Sem permissão para editar esta vaga'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'type',
      'salary',
      'salaryType',
      'location',
      'requirements',
      'benefits',
      'workSchedule',
      'startDate',
      'endDate',
      'vacancies',
      'isActive'
    ];

    const updateData = allowedFields.reduce((data, field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        data[field] = req.body[field];
      }
      return data;
    }, {});

    if (typeof updateData.title === 'string') updateData.title = updateData.title.trim();
    if (typeof updateData.description === 'string') updateData.description = updateData.description.trim();
    if (typeof updateData.category === 'string') updateData.category = updateData.category.trim();
    if (typeof updateData.location === 'string') updateData.location = updateData.location.trim();
    if (typeof updateData.workSchedule === 'string') {
      updateData.workSchedule = updateData.workSchedule.trim() || null;
    }
    if (Object.prototype.hasOwnProperty.call(updateData, 'salary')) {
      updateData.salary = updateData.salary ? Number(updateData.salary) : null;
    }
    if (Object.prototype.hasOwnProperty.call(updateData, 'vacancies')) {
      updateData.vacancies = Number(updateData.vacancies || 1);
    }
    if (Array.isArray(updateData.requirements)) {
      updateData.requirements = updateData.requirements.map(item => String(item).trim()).filter(Boolean);
    }
    if (Array.isArray(updateData.benefits)) {
      updateData.benefits = updateData.benefits.map(item => String(item).trim()).filter(Boolean);
    }

    const updatedJob = await JobVacancy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('companyId', 'name avatar companyDescription');

    res.json({
      success: true,
      job: updatedJob
    });
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar vaga',
      error: error.message
    });
  }
};

// @desc    Deletar vaga
// @route   DELETE /api/jobs/:id
// @access  Private (apenas empresa dona da vaga OU admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false,
        message: 'Vaga não encontrada'
      });
    }

    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const isOwner = job.companyId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false,
        message: 'Sem permissão para deletar esta vaga'
      });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Vaga deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar vaga:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar vaga',
      error: error.message
    });
  }
};

// @desc    Candidatar-se a vaga
// @route   POST /api/jobs/:id/apply
// @access  Private (prestadores)
export const applyToJob = async (req, res) => {
  try {
    const { message, resume } = req.body;
    const jobId = req.params.id;
    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';

    if (!isAdmin && req.user.type !== 'provider') {
      return res.status(403).json({
        success: false,
        message: 'Apenas prestadores podem se candidatar a vagas'
      });
    }

    if (!message || message.trim().length < 20 || message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem deve ter entre 20 e 1000 caracteres'
      });
    }

    const job = await JobVacancy.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false,
        message: 'Vaga não encontrada'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({ success: false,
        message: 'Esta vaga não está mais ativa'
      });
    }

    if (String(job.companyId) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode se candidatar à própria vaga'
      });
    }

    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ success: false,
        message: 'Você já se candidatou a esta vaga'
      });
    }

    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      message: message.trim(),
      resume: resume?.trim() || null
    });

    job.applicationsCount += 1;
    await job.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('jobId', 'title type salary')
      .populate('applicantId', 'name email phone avatar');

    res.status(201).json({
      success: true,
      application: populatedApplication
    });
  } catch (error) {
    console.error('Erro ao candidatar:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao candidatar-se',
      error: error.message
    });
  }
};

// @desc    Obter minhas candidaturas
// @route   GET /api/jobs/my-applications
// @access  Private
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'name avatar' }
      })
      .sort('-createdAt');

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar candidaturas',
      error: error.message
    });
  }
};

// @desc    Obter candidaturas de uma vaga
// @route   GET /api/jobs/:id/applications
// @access  Private (apenas empresa dona da vaga OU admin)
export const getJobApplications = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false,
        message: 'Vaga não encontrada'
      });
    }

    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const isOwner = job.companyId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false,
        message: 'Sem permissão para ver candidaturas desta vaga'
      });
    }

    if (isOwner) {
      await Application.updateMany(
        {
          jobId: req.params.id,
          status: 'pending',
          companyUnread: true
        },
        {
          $set: {
            companyUnread: false,
            companyViewedAt: new Date()
          }
        }
      );
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('applicantId', 'name email phone avatar city state category pricePerHour providerRating providerReviewCount')
      .sort('-createdAt');

    res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('❌ Erro ao buscar candidaturas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar candidaturas',
      error: error.message
    });
  }
};

// @desc    Atualizar status de candidatura
// @route   PUT /api/jobs/applications/:id
// @access  Private (apenas empresa OU admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, companyResponse } = req.body;
    const allowedStatuses = ['reviewing', 'accepted', 'rejected', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status de candidatura inválido'
      });
    }
    
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({ success: false,
        message: 'Candidatura não encontrada'
      });
    }

    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const isOwner = application.jobId.companyId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false,
        message: 'Sem permissão para atualizar esta candidatura'
      });
    }

    if (application.status !== 'pending' && application.status !== 'reviewing') {
      return res.status(400).json({
        success: false,
        message: 'Esta candidatura já foi finalizada'
      });
    }

    application.status = status;
    if (companyResponse) application.companyResponse = companyResponse.trim();
    application.companyUnread = false;
    application.companyViewedAt = application.companyViewedAt || new Date();
    application.reviewedAt = new Date();

    await application.save();

    const updatedApplication = await Application.findById(application._id)
      .populate('jobId', 'title type')
      .populate('applicantId', 'name email phone');

    res.json({
      success: true,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Erro ao atualizar candidatura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar candidatura',
      error: error.message
    });
  }
};

// @desc    Enviar proposta para prestador
// @route   POST /api/jobs/:id/propose
// @access  Private (apenas empresas)
export const proposeToProvider = async (req, res) => {
  try {
    const { providerId, message, offeredSalary } = req.body;
    const jobId = req.params.id;
    const normalizedMessage = message?.trim();

    if (!providerId) {
      return res.status(400).json({
        success: false,
        message: 'Prestador é obrigatório'
      });
    }

    if (!normalizedMessage || normalizedMessage.length < 10 || normalizedMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem deve ter entre 10 e 1000 caracteres'
      });
    }

    const job = await JobVacancy.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false,
        message: 'Vaga não encontrada'
      });
    }

    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const isOwner = job.companyId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false,
        message: 'Sem permissão para enviar proposta por esta vaga'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível enviar proposta por uma vaga inativa'
      });
    }

    const provider = await User.findById(providerId);
    if (!provider || provider.type !== 'provider') {
      return res.status(404).json({
        success: false,
        message: 'Prestador não encontrado'
      });
    }

    // Verificar se já enviou proposta
    const existingProposal = await JobProposal.findOne({
      jobId,
      providerId
    });

    if (existingProposal) {
      return res.status(400).json({ success: false,
        message: 'Proposta já enviada para este prestador'
      });
    }

    const proposal = await JobProposal.create({
      jobId,
      companyId: req.user.id,
      providerId,
      message: normalizedMessage,
      offeredSalary: offeredSalary ? Number(offeredSalary) : null
    });

    const populatedProposal = await JobProposal.findById(proposal._id)
      .populate('jobId', 'title type salary')
      .populate('companyId', 'name avatar companyDescription')
      .populate('providerId', 'name email phone');

    res.status(201).json({
      success: true,
      proposal: populatedProposal
    });
  } catch (error) {
    console.error('Erro ao enviar proposta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar proposta',
      error: error.message
    });
  }
};

// @desc    Obter propostas recebidas (prestador)
// @route   GET /api/jobs/my-proposals
// @access  Private (prestadores)
export const getMyProposals = async (req, res) => {
  try {
    const proposals = await JobProposal.find({ providerId: req.user.id })
      .populate({
        path: 'jobId',
        populate: { path: 'companyId', select: 'name avatar companyDescription' }
      })
      .populate('companyId', 'name avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      count: proposals.length,
      proposals
    });
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar propostas',
      error: error.message
    });
  }
};

// @desc    Obter propostas enviadas (empresa)
// @route   GET /api/jobs/sent-proposals
// @access  Private (empresas)
export const getSentProposals = async (req, res) => {
  try {
    const isAdmin = req.user.type === 'admin' || req.user.role === 'admin';
    const query = isAdmin ? {} : { companyId: req.user.id };

    const proposals = await JobProposal.find(query)
      .populate('jobId', 'title type salary location')
      .populate('providerId', 'name avatar category pricePerHour providerRating providerReviewCount')
      .populate('companyId', 'name avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      count: proposals.length,
      proposals
    });
  } catch (error) {
    console.error('Erro ao buscar propostas enviadas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar propostas enviadas',
      error: error.message
    });
  }
};

// @desc    Responder proposta
// @route   PUT /api/jobs/proposals/:id
// @access  Private (prestador)
export const respondToProposal = async (req, res) => {
  try {
    const { status, providerResponse } = req.body;
    const allowedStatuses = ['accepted', 'rejected', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status de proposta inválido'
      });
    }
    
    const proposal = await JobProposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false,
        message: 'Proposta não encontrada'
      });
    }

    if (proposal.providerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false,
        message: 'Sem permissão para responder esta proposta'
      });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Esta proposta já foi respondida'
      });
    }

    proposal.status = status;
    if (providerResponse) proposal.providerResponse = providerResponse.trim();
    proposal.respondedAt = new Date();

    await proposal.save();

    const updatedProposal = await JobProposal.findById(proposal._id)
      .populate('jobId', 'title type salary')
      .populate('companyId', 'name avatar');

    res.json({
      success: true,
      proposal: updatedProposal
    });
  } catch (error) {
    console.error('Erro ao responder proposta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao responder proposta',
      error: error.message
    });
  }
};
