// Locais/backend/src/controllers/adminController.js
import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';
import JobVacancy from '../models/JobVacancy.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js'; // Assumindo a existência de um modelo Settings

// Função utilitária para lidar com erros assíncronos (asyncHandler)
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
    return res.status(400).json({
      success: false,
      message: 'Usuário já existe'
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

// @desc    Listar todos os usuários (Atualizado para paginação)
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
    .limit(limit)
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
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }

  res.json({ success: true, user });
});

// @desc    Obter estatísticas gerais (Atualizado para o formato do frontend)
// @route   GET /api/admin/stats
// @access  Private (apenas admin)
export const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalServices,
    pendingReviews,
    monthlyRevenue // Simulação, pois não temos modelo de transação
  ] = await Promise.all([
    User.countDocuments(),
    ServiceRequest.countDocuments(),
    Review.countDocuments({ status: 'pending' }),
    Promise.resolve(15000.50) // Valor simulado
  ]);

  res.json({
    success: true,
    totalUsers,
    totalServices,
    pendingReviews,
    monthlyRevenue
  });
});

// @desc    Obter estatísticas de reviews (Mantido, mas não usado pelo novo frontend)
// @route   GET /api/admin/review-stats
// @access  Private (apenas admin)
export const getReviewStats = asyncHandler(async (req, res) => {
  const [
    flaggedCount,
    underReviewCount,
    totalReports,
    topReportedReviews
  ] = await Promise.all([
    Review.countDocuments({ status: 'flagged' }),
    Review.countDocuments({ status: 'under_review' }),
    Review.aggregate([
      { $group: { _id: null, total: { $sum: '$reportsCount' } } }
    ]),
    Review.find({ reportsCount: { $gt: 0 } })
      .sort('-reportsCount')
      .limit(5)
      .populate('reviewerId', 'name')
      .populate('reviewedUserId', 'name')
  ]);

  res.json({
    success: true,
    stats: {
      flagged: flaggedCount,
      underReview: underReviewCount,
      totalReports: totalReports[0]?.total || 0,
      topReported: topReportedReviews
    }
  });
});

// @desc    Deletar qualquer usuário
// @route   DELETE /api/admin/users/:id
// @access  Private (apenas admin)
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }

  if (user.role === 'admin' && user._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
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
    return res.status(404).json({
      success: false,
      message: 'Usuário não encontrado'
    });
  }

  // Previne que um admin remova o próprio status de admin
  if (user.role === 'admin' && req.user.id === req.params.id && req.body.role !== 'admin') {
    return res.status(403).json({
      success: false,
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

// --- NOVAS FUNÇÕES PARA O PAINEL ADMIN ---

// @desc    Obter reviews pendentes
// @route   GET /api/admin/reviews/pending
// @access  Private (apenas admin)
export const getPendingReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ status: 'pending' })
    .limit(limit)
    .skip(skip)
    .populate('reviewerId', 'name') // Assumindo que reviewerId é o autor
    .populate('reviewedItemId', 'title'); // Assumindo que reviewedItemId é o alvo (serviço/vaga)

  const totalItems = await Review.countDocuments({ status: 'pending' });
  const totalPages = Math.ceil(totalItems / limit);

  res.json({
    success: true,
    reviews,
    totalPages,
    currentPage: parseInt(page),
    totalItems
  });
});

// @desc    Aprovar review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private (apenas admin)
export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review não encontrada' });
  }

  res.status(200).json({ success: true, message: 'Review aprovada com sucesso' });
});

// @desc    Rejeitar/Remover review
// @route   DELETE /api/admin/reviews/:id
// @access  Private (apenas admin)
export const rejectReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review não encontrada' });
  }

  res.status(200).json({ success: true, message: 'Review removida com sucesso' });
});

// @desc    Obter conteúdo (Serviços ou Vagas)
// @route   GET /api/admin/content
// @access  Private (apenas admin)
export const getContent = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  let Model;

  if (type === 'services') {
    Model = ServiceRequest;
    query.isJob = false;
  } else if (type === 'jobs') {
    Model = JobVacancy;
    query.isJob = true;
  } else {
    return res.status(400).json({ success: false, message: 'Tipo de conteúdo inválido' });
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const content = await Model.find(query)
    .limit(limit)
    .skip(skip)
    .sort('-createdAt');

  const totalItems = await Model.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  res.json({
    success: true,
    content,
    totalPages,
    currentPage: parseInt(page),
    totalItems
  });
});

// @desc    Deletar conteúdo (Serviço ou Vaga)
// @route   DELETE /api/admin/content/:id
// @access  Private (apenas admin)
export const deleteContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type } = req.query; // Espera-se que o frontend passe o tipo (services ou jobs)

  let Model;
  if (type === 'services') {
    Model = ServiceRequest;
  } else if (type === 'jobs') {
    Model = JobVacancy;
  } else {
    return res.status(400).json({ success: false, message: 'Tipo de conteúdo inválido' });
  }

  const item = await Model.findByIdAndDelete(id);

  if (!item) {
    return res.status(404).json({ success: false, message: 'Conteúdo não encontrado' });
  }

  res.status(200).json({ success: true, message: 'Conteúdo deletado com sucesso' });
});

// @desc    Obter configurações globais
// @route   GET /api/admin/settings
// @access  Private (apenas admin)
export const getSettings = asyncHandler(async (req, res) => {
  // Assumindo que existe um único documento de configurações
  const settings = await Settings.findOne() || {
    maxUploadSize: 5,
    allowedCategories: 'Eletricista, Limpeza, Encanador, TI',
    maintenanceMode: false,
  };

  res.status(200).json({ success: true, settings });
});

// @desc    Atualizar configurações globais
// @route   PUT /api/admin/settings
// @access  Private (apenas admin)
export const updateSettings = asyncHandler(async (req, res) => {
  const { maxUploadSize, allowedCategories, maintenanceMode } = req.body;

  const settings = await Settings.findOneAndUpdate(
    {}, // Busca o único documento
    { maxUploadSize, allowedCategories, maintenanceMode },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'Configurações salvas com sucesso', settings });
});
