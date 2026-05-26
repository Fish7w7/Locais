import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { anonymizeUserAccount } from '../utils/accountAnonymization.js';
import { normalizeAssetUrl, normalizePortfolioUrls } from '../utils/assetValidation.js';

// @desc    Atualizar perfil do usuario
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar, city, state } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (Object.prototype.hasOwnProperty.call(req.body, 'avatar')) {
      user.avatar = normalizeAssetUrl(avatar, 'Avatar');
    }
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
      message: error.message || 'Erro ao atualizar perfil'
    });
  }
};

// @desc    Converter cliente em prestador
// @route   POST /api/users/upgrade-to-provider
// @access  Private
export const upgradeToProvider = async (req, res) => {
  try {
    const { category, pricePerHour, description } = req.body;
    const normalizedPrice = Number(pricePerHour);

    if (!category || !description || !Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
      return res.status(400).json({ success: false,
        message: 'Categoria, preco e descricao sao obrigatorios'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.type === 'company') {
      return res.status(400).json({ success: false,
        message: 'Empresas nao podem ser prestadores'
      });
    }

    if (user.type === 'provider') {
      return res.status(400).json({ success: false,
        message: 'Usuario ja e prestador'
      });
    }

    await user.upgradeToProvider({ category, pricePerHour: normalizedPrice, description });

    res.json({
      success: true,
      message: 'Agora voce e um prestador!',
      user
    });
  } catch (error) {
    console.error('Erro ao converter para prestador:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao converter para prestador'
    });
  }
};

// @desc    Atualizar informacoes de prestador
// @route   PUT /api/users/provider-info
// @access  Private
export const updateProviderInfo = async (req, res) => {
  try {
    const { category, pricePerHour, description, portfolio, isAvailableAsProvider } = req.body;

    const user = await User.findById(req.user.id);

    if (user.type !== 'provider') {
      return res.status(400).json({ success: false,
        message: 'Apenas prestadores podem atualizar essas informacoes'
      });
    }

    if (category) user.category = category;
    if (pricePerHour !== undefined) {
      const normalizedPrice = Number(pricePerHour);
      if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
        return res.status(400).json({ success: false, message: 'Preco por hora invalido' });
      }
      user.pricePerHour = normalizedPrice;
    }
    if (description) user.description = description;
    if (Object.prototype.hasOwnProperty.call(req.body, 'portfolio')) {
      user.portfolio = normalizePortfolioUrls(portfolio);
    }
    if (typeof isAvailableAsProvider !== 'undefined') {
      user.isAvailableAsProvider = isAvailableAsProvider;
    }

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao atualizar informacoes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao atualizar informacoes'
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
      message: 'Erro ao buscar prestadores'
    });
  }
};

// @desc    Obter perfil de um usuario
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, isActive: true, isDeleted: { $ne: true } })
      .select('name avatar type category city state providerRating providerReviewCount clientRating clientReviewCount pricePerHour description isAvailableAsProvider companyDescription createdAt');

    if (!user) {
      return res.status(404).json({ success: false,
        message: 'Usuario nao encontrado'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Erro ao buscar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuario'
    });
  }
};

// @desc    Desativar conta do usuario
// @route   PUT /api/users/deactivate
// @access  Private
export const deactivateAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false,
        message: 'Senha e obrigatoria para desativar a conta'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (user.isDeleted) {
      return res.status(404).json({ success: false,
        message: 'Usuario nao encontrado'
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
      message: 'Conta desativada com sucesso. Seu perfil e publicacoes nao aparecerao publicamente enquanto a conta estiver desativada.'
    });
  } catch (error) {
    console.error('Erro ao desativar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar conta'
    });
  }
};

// @desc    Reativar conta do usuario
// @route   POST /api/users/reactivate
// @access  Public
export const reactivateAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false,
        message: 'Usuario nao encontrado'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false,
        message: 'Credenciais invalidas'
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
      message: 'Erro ao reativar conta'
    });
  }
};

// @desc    Excluir conta com anonimimizacao e retencao de registros de seguranca
// @route   DELETE /api/users/delete-account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (!password || confirmation !== 'DELETAR PERMANENTEMENTE') {
      return res.status(400).json({ success: false,
        message: 'Confirmacao invalida. Digite exatamente: DELETAR PERMANENTEMENTE'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user || user.isDeleted) {
      return res.status(404).json({ success: false,
        message: 'Usuario nao encontrado'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false,
        message: 'Senha incorreta'
      });
    }

    await anonymizeUserAccount(user);

    res.json({
      success: true,
      message: 'Conta excluida e dados pessoais anonimizados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar conta'
    });
  }
};
