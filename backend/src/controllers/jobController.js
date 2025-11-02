import JobVacancy from '../models/JobVacancy.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';

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

    const job = await JobVacancy.create({
      companyId: req.user.id,
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

// @desc    Obter vaga por ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id)
      .populate('companyId', 'name email phone avatar companyDescription');

    if (!job) {
      return res.status(404).json({
        success: false,
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
// @access  Private (apenas empresa dona da vaga)
export const updateJob = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    if (job.companyId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para editar esta vaga'
      });
    }

    const updatedJob = await JobVacancy.findByIdAndUpdate(
      req.params.id,
      req.body,
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
// @access  Private (apenas empresa dona da vaga)
export const deleteJob = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    if (job.companyId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
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
// @access  Private (clientes)
export const applyToJob = async (req, res) => {
  try {
    const { message, resume } = req.body;
    const jobId = req.params.id;

    const job = await JobVacancy.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    if (!job.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Esta vaga não está mais ativa'
      });
    }

    // Verificar se já se candidatou
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Você já se candidatou a esta vaga'
      });
    }

    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      message,
      resume
    });

    // Incrementar contador de candidaturas
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
// @access  Private (apenas empresa dona da vaga)
export const getJobApplications = async (req, res) => {
  try {
    const job = await JobVacancy.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    if (job.companyId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para ver candidaturas desta vaga'
      });
    }

    const applications = await Application.find({ jobId: req.params.id })
      .populate('applicantId', 'name email phone avatar clientRating clientReviewCount')
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

// @desc    Atualizar status de candidatura
// @route   PUT /api/jobs/applications/:id
// @access  Private (apenas empresa)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, companyResponse } = req.body;
    
    const application = await Application.findById(req.params.id).populate('jobId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidatura não encontrada'
      });
    }

    if (application.jobId.companyId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para atualizar esta candidatura'
      });
    }

    application.status = status;
    if (companyResponse) application.companyResponse = companyResponse;
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

    const job = await JobVacancy.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Vaga não encontrada'
      });
    }

    if (job.companyId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para enviar proposta por esta vaga'
      });
    }

    // Verificar se já enviou proposta
    const existingProposal = await JobProposal.findOne({
      jobId,
      providerId
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'Proposta já enviada para este prestador'
      });
    }

    const proposal = await JobProposal.create({
      jobId,
      companyId: req.user.id,
      providerId,
      message,
      offeredSalary
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

// @desc    Responder proposta
// @route   PUT /api/jobs/proposals/:id
// @access  Private (prestador)
export const respondToProposal = async (req, res) => {
  try {
    const { status, providerResponse } = req.body;
    
    const proposal = await JobProposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposta não encontrada'
      });
    }

    if (proposal.providerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para responder esta proposta'
      });
    }

    proposal.status = status;
    if (providerResponse) proposal.providerResponse = providerResponse;
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