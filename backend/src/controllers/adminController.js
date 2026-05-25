// backend/src/controllers/adminController.js
import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';
import JobVacancy from '../models/JobVacancy.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js';
import { refreshMaintenanceCache } from '../middlewares/maintenance.js';

// Função utilitária para lidar com erros assíncronos
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Criar conta admin
// @route   POST /api/admin/create-admin
// @access  Public (apenas para desenvolvimento)
export const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false,
      message: 'Usuário já existe'
    });
  }

  const admin = await User.create({ name: name || 'Admin Master',
    email,
    password,
    phone: '(00) 00000-0000',
    type: 'admin',
    role: 'admin'
  });

  res.status(201).json({
    success: true,
    message: '✅ Admin criado com sucesso!',
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      type: admin.type
    }
  });
});

// @desc    Listar todos os usuários
// @route   GET /api/admin/users
// @access  Private (apenas admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { type, role, page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  if (type) query.type = type;
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(skip);

  const totalItems = await User.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  res.json({
    success: true,
    users,
    totalPages,
    currentPage: parseInt(page),
    totalItems
  });
});

// @desc    Obter detalhes de um usuário
// @route   GET /api/admin/users/:id
// @access  Private (apenas admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({ success: false,
      message: 'Usuário não encontrado'
    });
  }

  res.json({ success: true, user });
});

// @desc    Obter estatísticas gerais
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
      totalReports: reportTotals[0].totalReports || 0
    }
  });
});

// @desc    Deletar qualquer usuário
// @route   DELETE /api/admin/users/:id
// @access  Private (apenas admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false,
      message: 'Usuário não encontrado'
    });
  }

  if (user.role === 'admin' && user._id.toString() !== req.user.id) {
    return res.status(403).json({ success: false,
      message: 'Não é possível deletar outro administrador'
    });
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'Usuário deletado com sucesso'
  });
});

// @desc    Atualizar qualquer usuário
// @route   PUT /api/admin/users/:id
// @access  Private (apenas admin)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false,
      message: 'Usuário não encontrado'
    });
  }

  // Previne que um admin remova o próprio status de admin
  if (user.role === 'admin' && req.user.id === req.params.id && req.body.role !== 'admin') {
    return res.status(403).json({ success: false,
      message: 'Você não pode remover seu próprio status de administrador'
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    user: updatedUser
  });
});

// @desc    Obter conteúdo (Serviços ou Vagas)
// @route   GET /api/admin/content
// @access  Private (apenas admin)
export const getContent = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  let Model;
  let query = {};

  console.log('🔍 Buscando conteúdo:', { type, page, limit, search });

  if (type === 'services') {
    Model = ServiceRequest;
  } else if (type === 'jobs') {
    Model = JobVacancy;
  } else {
    return res.status(400).json({ success: false, 
      message: 'Tipo de conteúdo inválido. Use "services" ou "jobs"' 
    });
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  try {
    // Popula os relacionamentos corretos
    const populateField = type === 'services' ? 'providerId' : 'companyId';
    
    const content = await Model.find(query)
      .populate(populateField, 'name email avatar')
      .limit(parseInt(limit))
      .skip(skip)
      .sort('-createdAt')
      .lean();

    const totalItems = await Model.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    console.log(`✅ Encontrados ${content.length} itens de ${type}`);

    res.json({
      success: true,
      content,
      totalPages,
      currentPage: parseInt(page),
      totalItems
    });
  } catch (error) {
    console.error('❌ Erro ao buscar conteúdo:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar ${type}: ${error.message}`
    });
  }
});

// @desc    Deletar conteúdo (Serviço ou Vaga)
// @route   DELETE /api/admin/content/:id
// @access  Private (apenas admin)
export const deleteContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.query;

  console.log('🗑️ Deletando conteúdo:', { id, type });

  if (!type || (type !== 'services' && type !== 'jobs')) {
    return res.status(400).json({ success: false, 
      message: 'Tipo de conteúdo inválido. Use "services" ou "jobs"' 
    });
  }

  let Model;
  if (type === 'services') {
    Model = ServiceRequest;
  } else {
    Model = JobVacancy;
  }

  const item = await Model.findByIdAndDelete(id);

  if (!item) {
    return res.status(404).json({ success: false, 
      message: 'Conteúdo não encontrado' 
    });
  }

  console.log(`✅ ${type === 'services' ? 'Serviço' : 'Vaga'} deletado com sucesso`);

  res.status(200).json({ 
    success: true, 
    message: 'Conteúdo deletado com sucesso' 
  });
});

// @desc    Obter configurações globais
// @route   GET /api/admin/settings
// @access  Private (apenas admin)
export const getSettings = asyncHandler(async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    // Se não existir, cria com valores padrão
    if (!settings) {
      settings = await Settings.create({ maxUploadSize: 5,
        allowedCategories: 'Eletricista, Limpeza, Encanador, TI',
        maintenanceMode: false,
      });
      console.log('⚙️ Configurações criadas com valores padrão');
    }

    console.log('⚙️ Configurações carregadas:', settings);

    res.status(200).json({ 
      success: true, 
      settings: {
        maxUploadSize: settings.maxUploadSize,
        allowedCategories: settings.allowedCategories,
        maintenanceMode: settings.maintenanceMode
      }
    });
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao buscar configurações: ${error.message}`
    });
  }
});

// @desc    Atualizar configurações globais
// @route   PUT /api/admin/settings
// @access  Private (apenas admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const { maxUploadSize, allowedCategories, maintenanceMode } = req.body;

  console.log('💾 Salvando configurações:', req.body);

  try {
    const settings = await Settings.findOneAndUpdate(
      {}, // Busca o único documento
      { 
        maxUploadSize: maxUploadSize !== undefined ? maxUploadSize : 5, 
        allowedCategories: allowedCategories || 'Eletricista, Limpeza, Encanador, TI', 
        maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false 
      },
      { 
        new: true, 
        upsert: true, // Cria se não existir
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    console.log('✅ Configurações salvas:', settings);
    await refreshMaintenanceCache();
    console.log('🔄 Cache de manutenção atualizado após salvar settings');

    res.status(200).json({ 
      success: true, 
      message: 'Configurações salvas com sucesso', 
      settings: {
        maxUploadSize: settings.maxUploadSize,
        allowedCategories: settings.allowedCategories,
        maintenanceMode: settings.maintenanceMode
      }
    });
  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao salvar configurações: ${error.message}`
    });
  }
});
