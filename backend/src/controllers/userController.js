import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import JobVacancy from '../models/JobVacancy.js';

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, city, state } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (city) user.city = city;
    if (state) user.state = state;

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil',
      error: error.message
    });
  }
};

// @desc    Converter cliente em prestador
// @route   POST /api/users/upgrade-to-provider
// @access  Private
export const upgradeToProvider = async (req, res) => {
  try {
    const { category, pricePerHour, description } = req.body;

    if (!category || !pricePerHour || !description) {
      return res.status(400).json({ success: false,
        message: 'Categoria, preço e descrição são obrigatórios'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.type === 'company') {
      return res.status(400).json({ success: false,
        message: 'Empresas não podem ser prestadores'
      });
    }

    if (user.type === 'provider') {
      return res.status(400).json({ success: false,
        message: 'Usuário já é prestador'
      });
    }

    await user.upgradeToProvider({ category, pricePerHour, description });

    res.json({
      success: true,
      message: 'Agora você é um prestador!',
      user
    });
  } catch (error) {
    console.error('Erro ao converter para prestador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao converter para prestador',
      error: error.message
    });
  }
};

// @desc    Atualizar informações de prestador
// @route   PUT /api/users/provider-info
// @access  Private
export const updateProviderInfo = async (req, res) => {
  try {
    const { category, pricePerHour, description, portfolio, isAvailableAsProvider } = req.body;

    const user = await User.findById(req.user.id);

    if (user.type !== 'provider') {
      return res.status(400).json({ success: false,
        message: 'Apenas prestadores podem atualizar essas informações'
      });
    }

    if (category) user.category = category;
    if (pricePerHour) user.pricePerHour = pricePerHour;
    if (description) user.description = description;
    if (portfolio) user.portfolio = portfolio;
    if (typeof isAvailableAsProvider !== 'undefined') {
      user.isAvailableAsProvider = isAvailableAsProvider;
    }

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao atualizar informações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar informações',
      error: error.message
    });
  }
};

// @desc    Buscar prestadores
// @route   GET /api/users/providers
// @access  Public
export const getProviders = async (req, res) => {
  try {
    const { category, city, minRating } = req.query;

    const query = { type: 'provider',
      isActive: true,
      isDeleted: { $ne: true },
      isAvailableAsProvider: true,
      category: { $nin: [null, ''] },
      pricePerHour: { $gt: 0 },
      description: { $nin: [null, ''] }
    };

    if (category) query.category = category;
    if (city) query.city = city;
    if (minRating) query.providerRating = { $gte: parseFloat(minRating) };

    const providers = await User.find(query)
      .select('name avatar type category city state providerRating providerReviewCount pricePerHour description isAvailableAsProvider createdAt')
      .sort('-providerRating');

    res.json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    console.error('Erro ao buscar prestadores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar prestadores',
      error: error.message
    });
  }
};

// @desc    Obter perfil de um usuário
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isActive: true, isDeleted: { $ne: true } })
      .select('name avatar type category city state providerRating providerReviewCount clientRating clientReviewCount pricePerHour description isAvailableAsProvider companyDescription createdAt');

    if (!user) {
      return res.status(404).json({ success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
};

// @desc    Desativar conta do usuário
// @route   PUT /api/users/deactivate
// @access  Private
export const deactivateAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false,
        message: 'Senha é obrigatória para desativar a conta'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (user.isDeleted) {
      return res.status(404).json({ success: false,
        message: 'Usuário não encontrado'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false,
        message: 'Senha incorreta'
      });
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Conta desativada com sucesso. Seu perfil e publicações não aparecerão publicamente enquanto a conta estiver desativada.'
    });
  } catch (error) {
    console.error('Erro ao desativar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar conta',
      error: error.message
    });
  }
};

// @desc    Reativar conta do usuário
// @route   POST /api/users/reactivate
// @access  Public
export const reactivateAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.isDeleted) {
      return res.status(404).json({ success: false,
        message: 'Usuário não encontrado'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false,
        message: 'Credenciais inválidas'
      });
    }

    user.isActive = true;
    user.deactivatedAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Conta reativada com sucesso!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type
      }
    });
  } catch (error) {
    console.error('Erro ao reativar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reativar conta',
      error: error.message
    });
  }
};

// @desc    Deletar permanentemente a conta
// @route   DELETE /api/users/delete-account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (!password || confirmation !== 'DELETAR PERMANENTEMENTE') {
      return res.status(400).json({ success: false,
        message: 'Confirmação inválida. Digite exatamente: DELETAR PERMANENTEMENTE'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false,
        message: 'Senha incorreta'
      });
    }

    const userId = user._id;
    const deletedAt = new Date();
    const hashSecret = process.env.JWT_SECRET || 'servicos-locais';
    const deletedEmailHash = crypto
      .createHmac('sha256', hashSecret)
      .update(String(user.email || '').toLowerCase())
      .digest('hex');
    const anonymizedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    await Promise.all([
      JobVacancy.updateMany(
        { companyId: userId },
        { $set: { isActive: false } }
      ),
      User.updateOne(
        { _id: userId },
        {
          $set: {
            name: 'Usuário excluído',
            email: `deleted-${userId}@deleted.local`,
            phone: 'Conta excluída',
            password: anonymizedPassword,
            avatar: null,
            type: user.type,
            role: user.role,
            providerRating: 0,
            providerReviewCount: 0,
            clientRating: 0,
            clientReviewCount: 0,
            category: null,
            pricePerHour: null,
            portfolio: [],
            isAvailableAsProvider: false,
            description: null,
            companyDescription: null,
            city: null,
            state: null,
            resetPasswordToken: null,
            resetPasswordExpire: null,
            isActive: false,
            deactivatedAt: deletedAt,
            isDeleted: true,
            deletedAt,
            deletedEmailHash
          },
          $unset: {
            cnpj: ''
          }
        }
      )
    ]);

    res.json({
      success: true,
      message: 'Conta excluída e dados pessoais anonimizados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar conta',
      error: error.message
    });
  }
};
