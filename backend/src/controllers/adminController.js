import User from '../models/User.js';
import ServiceRequest from '../models/ServiceRequest.js';
import JobVacancy from '../models/JobVacancy.js';
import Application from '../models/Application.js';
import JobProposal from '../models/JobProposal.js';

// @desc    Criar conta admin
// @route   POST /api/admin/create-admin
// @access  Public (apenas para desenvolvimento)
export const createAdmin = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Verificar se já existe admin com este email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe'
      });
    }

    // Criar admin
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
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar admin',
      error: error.message
    });
  }
};

// @desc    Listar todos os usuários
// @route   GET /api/admin/users
// @access  Private (apenas admin)
export const getAllUsers = async (req, res) => {
  try {
    const { type, role } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (role) query.role = role;

    const users = await User.find(query).select('-password').sort('-createdAt');

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
};

// @desc    Obter estatísticas gerais
// @route   GET /api/admin/stats
// @access  Private (apenas admin)
export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalProviders,
      totalCompanies,
      totalServices,
      totalJobs,
      totalApplications,
      totalProposals
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ type: 'client' }),
      User.countDocuments({ type: 'provider' }),
      User.countDocuments({ type: 'company' }),
      ServiceRequest.countDocuments(),
      JobVacancy.countDocuments(),
      Application.countDocuments(),
      JobProposal.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          clients: totalClients,
          providers: totalProviders,
          companies: totalCompanies
        },
        services: totalServices,
        jobs: totalJobs,
        applications: totalApplications,
        proposals: totalProposals
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};

// @desc    Deletar qualquer usuário
// @route   DELETE /api/admin/users/:id
// @access  Private (apenas admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir deletar outro admin
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
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário',
      error: error.message
    });
  }
};

// @desc    Atualizar qualquer usuário
// @route   PUT /api/admin/users/:id
// @access  Private (apenas admin)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
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
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
};