import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';
import JobVacancy from '../models/JobVacancy.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js';
import { refreshMaintenanceCache } from '../middlewares/maintenance.js';
import { anonymizeUserAccount } from '../utils/accountAnonymization.js';
import { normalizeAssetUrl, normalizePortfolioUrls } from '../utils/assetValidation.js';

const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const isDevelopment = process.env.NODE_ENV !== 'production';

const pickAdminUserUpdates = (body) => {
  const allowedFields = [
    'name',
    'email',
    'phone',
    'type',
    'role',
    'avatar',
    'city',
    'state',
    'category',
    'pricePerHour',
    'portfolio',
    'description',
    'isAvailableAsProvider',
    'companyDescription',
    'cnpj',
    'isActive'
  ];

  return allowedFields.reduce((updates, field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      updates[field] = body[field];
    }
    return updates;
  }, {});
};

// @desc    Criar conta admin
// @route   POST /api/admin/create-admin
// @access  Public (apenas desenvolvimento)
export const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false,
      message: 'Usuario ja existe'
    });
  }

  const admin = await User.create({
    name: name || 'Admin Master',
    email,
    password,
    phone: '(00) 00000-0000',
    type: 'admin',
    role: 'admin'
  });

  res.status(201).json({
    success: true,
    message: 'Admin criado com sucesso',
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      type: admin.type
    }
  });
});

// @desc    Listar todos os usuarios
// @route   GET /api/admin/users
// @access  Private (apenas admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { type, role, page = 1, limit = 10, search = '' } = req.query;
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * pageLimit;

  const query = {};
  if (type) query.type = type;
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const [users, totalItems] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(pageLimit)
      .skip(skip),
    User.countDocuments(query)
  ]);

  res.json({
    success: true,
    users,
    totalPages: Math.ceil(totalItems / pageLimit),
    currentPage: pageNumber,
    totalItems
  });
});

// @desc    Obter detalhes de um usuario
// @route   GET /api/admin/users/:id
// @access  Private (apenas admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({ success: false,
      message: 'Usuario nao encontrado'
    });
  }

  res.json({ success: true, user });
});

// @desc    Obter estatisticas gerais
// @route   GET /api/admin/stats
// @access  Private (apenas admin)
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    services,
    jobs,
    applications,
    proposals,
    pendingReviews,
    clientsCount,
    providersCount,
    companiesCount
  ] = await Promise.all([
    User.countDocuments(),
    ServiceRequest.countDocuments(),
    JobVacancy.countDocuments(),
    Application.countDocuments(),
    JobProposal.countDocuments(),
    Review.countDocuments({
      $or: [
        { status: 'flagged' },
        { status: 'under_review' }
      ]
    }),
    User.countDocuments({ type: 'client' }),
    User.countDocuments({ type: 'provider' }),
    User.countDocuments({ type: 'company' })
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      services,
      jobs,
      applications,
      proposals,
      pendingReviews,
      users: {
        clients: clientsCount,
        providers: providersCount,
        companies: companiesCount
      }
    }
  });
});

// @desc    Obter estatisticas de moderacao de avaliacoes
// @route   GET /api/admin/review-stats
// @access  Private (apenas admin)
export const getReviewStats = asyncHandler(async (req, res) => {
  const [flagged, underReview, reportTotals] = await Promise.all([
    Review.countDocuments({ status: 'flagged' }),
    Review.countDocuments({ status: 'under_review' }),
    Review.aggregate([
      {
        $group: {
          _id: null,
          totalReports: { $sum: '$reportsCount' }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    stats: {
      flagged,
      underReview,
      totalReports: reportTotals[0]?.totalReports || 0
    }
  });
});

// @desc    Anonimizar qualquer usuario
// @route   DELETE /api/admin/users/:id
// @access  Private (apenas admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false,
      message: 'Usuario nao encontrado'
    });
  }

  if (user.isDeleted) {
    return res.status(400).json({ success: false,
      message: 'Usuario ja esta anonimizado'
    });
  }

  if (user.role === 'admin' && user._id.toString() !== req.user.id) {
    return res.status(403).json({ success: false,
      message: 'Nao e possivel excluir outro administrador'
    });
  }

  await anonymizeUserAccount(user);

  res.json({
    success: true,
    message: 'Usuario anonimizado com sucesso'
  });
});

// @desc    Atualizar qualquer usuario
// @route   PUT /api/admin/users/:id
// @access  Private (apenas admin)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false,
      message: 'Usuario nao encontrado'
    });
  }

  if (user.isDeleted) {
    return res.status(400).json({ success: false,
      message: 'Usuario anonimizado nao pode ser editado'
    });
  }

  const updates = pickAdminUserUpdates(req.body);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false,
      message: 'Nenhum campo permitido foi enviado para atualizacao'
    });
  }

  if (user.role === 'admin' && req.user.id === req.params.id && updates.role && updates.role !== 'admin') {
    return res.status(403).json({ success: false,
      message: 'Voce nao pode remover seu proprio status de administrador'
    });
  }

  if (updates.email && updates.email !== user.email) {
    const emailExists = await User.exists({ email: updates.email, _id: { $ne: user._id } });
    if (emailExists) {
      return res.status(400).json({ success: false,
        message: 'Email ja cadastrado por outro usuario'
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'avatar')) {
    updates.avatar = normalizeAssetUrl(updates.avatar, 'Avatar');
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'pricePerHour')) {
    const normalizedPrice = Number(updates.pricePerHour);
    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      return res.status(400).json({ success: false,
        message: 'Preco por hora invalido'
      });
    }
    updates.pricePerHour = normalizedPrice;
  }

  if (Object.prototype.hasOwnProperty.call(updates, 'portfolio')) {
    updates.portfolio = normalizePortfolioUrls(updates.portfolio);
  }

  Object.assign(user, updates);
  await user.save();

  const updatedUser = await User.findById(user._id).select('-password');

  res.json({
    success: true,
    user: updatedUser
  });
});

// @desc    Obter conteudo (servicos ou vagas)
// @route   GET /api/admin/content
// @access  Private (apenas admin)
export const getContent = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10, search = '' } = req.query;
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const pageLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNumber - 1) * pageLimit;

  let Model;
  let query = {};

  if (isDevelopment) {
    console.log('Buscando conteudo:', { type, page: pageNumber, limit: pageLimit, search });
  }

  if (type === 'services') {
    Model = ServiceRequest;
  } else if (type === 'jobs') {
    Model = JobVacancy;
  } else {
    return res.status(400).json({ success: false,
      message: 'Tipo de conteudo invalido. Use "services" ou "jobs"'
    });
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const populateField = type === 'services' ? 'providerId' : 'companyId';
  const [content, totalItems] = await Promise.all([
    Model.find(query)
      .populate(populateField, 'name email avatar')
      .limit(pageLimit)
      .skip(skip)
      .sort('-createdAt')
      .lean(),
    Model.countDocuments(query)
  ]);

  res.json({
    success: true,
    content,
    totalPages: Math.ceil(totalItems / pageLimit),
    currentPage: pageNumber,
    totalItems
  });
});

// @desc    Deletar conteudo (servico ou vaga)
// @route   DELETE /api/admin/content/:id
// @access  Private (apenas admin)
export const deleteContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  if (!type || (type !== 'services' && type !== 'jobs')) {
    return res.status(400).json({ success: false,
      message: 'Tipo de conteudo invalido. Use "services" ou "jobs"'
    });
  }

  const Model = type === 'services' ? ServiceRequest : JobVacancy;
  const item = await Model.findByIdAndDelete(id);

  if (!item) {
    return res.status(404).json({ success: false,
      message: 'Conteudo nao encontrado'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Conteudo deletado com sucesso'
  });
});

// @desc    Obter configuracoes globais
// @route   GET /api/admin/settings
// @access  Private (apenas admin)
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      maxUploadSize: 5,
      allowedCategories: 'Eletricista, Limpeza, Encanador, TI',
      maintenanceMode: false
    });
  }

  res.status(200).json({
    success: true,
    settings: {
      maxUploadSize: settings.maxUploadSize,
      allowedCategories: settings.allowedCategories,
      maintenanceMode: settings.maintenanceMode
    }
  });
});

// @desc    Atualizar configuracoes globais
// @route   PUT /api/admin/settings
// @access  Private (apenas admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const { maxUploadSize, allowedCategories, maintenanceMode } = req.body;

  const settings = await Settings.findOneAndUpdate(
    {},
    {
      maxUploadSize: maxUploadSize !== undefined ? maxUploadSize : 5,
      allowedCategories: allowedCategories || 'Eletricista, Limpeza, Encanador, TI',
      maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  await refreshMaintenanceCache();

  res.status(200).json({
    success: true,
    message: 'Configuracoes salvas com sucesso',
    settings: {
      maxUploadSize: settings.maxUploadSize,
      allowedCategories: settings.allowedCategories,
      maintenanceMode: settings.maintenanceMode
    }
  });
});
