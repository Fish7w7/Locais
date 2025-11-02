import User from '../models/User.js';

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
// @access  Private (apenas clientes)
export const upgradeToProvider = async (req, res) => {
  try {
    const { category, pricePerHour, description } = req.body;

    if (!category || !pricePerHour || !description) {
      return res.status(400).json({
        success: false,
        message: 'Categoria, preço e descrição são obrigatórios'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.type === 'company') {
      return res.status(400).json({
        success: false,
        message: 'Empresas não podem ser prestadores'
      });
    }

    if (user.type === 'provider') {
      return res.status(400).json({
        success: false,
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
// @access  Private (apenas prestadores)
export const updateProviderInfo = async (req, res) => {
  try {
    const { category, pricePerHour, description, portfolio, isAvailableAsProvider } = req.body;

    const user = await User.findById(req.user.id);

    if (user.type !== 'provider') {
      return res.status(400).json({
        success: false,
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

    const query = {
      type: 'provider',
      isAvailableAsProvider: true
    };

    if (category) query.category = category;
    if (city) query.city = city;
    if (minRating) query.providerRating = { $gte: parseFloat(minRating) };

    const providers = await User.find(query)
      .select('-password')
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
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
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