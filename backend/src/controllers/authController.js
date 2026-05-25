// backend/src/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';

// Gerar JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      type,
      cnpj,
      companyDescription,
      category,
      pricePerHour,
      description,
      isAvailableAsProvider
    } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false,
        message: 'Email já cadastrado'
      });
    }

    // Validações específicas por tipo
    if (type === 'company' && !cnpj) {
      return res.status(400).json({ success: false,
        message: 'CNPJ é obrigatório para empresas'
      });
    }

    if (type === 'provider') {
      const normalizedPrice = Number(pricePerHour);

      if (!category || !description || !Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
        return res.status(400).json({ success: false,
          message: 'Categoria, preço e descrição são obrigatórios para prestadores'
        });
      }
    }

    // Criar usuário
    const userData = {
      name,
      email,
      phone,
      password,
      type: type || 'client'
    };

    if (type === 'company') {
      userData.cnpj = cnpj;
      userData.companyDescription = companyDescription;
    }

    if (type === 'provider') {
      userData.category = category;
      userData.pricePerHour = Number(pricePerHour);
      userData.description = description;
      userData.isAvailableAsProvider = isAvailableAsProvider !== false;
    }

    const user = await User.create(userData);

    // Gerar token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: user.type,
        role: user.role,
        avatar: user.avatar,
        category: user.category,
        pricePerHour: user.pricePerHour,
        description: user.description,
        isAvailableAsProvider: user.isAvailableAsProvider
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: error.message
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false,
        message: 'Por favor, forneça email e senha'
      });
    }

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false,
        message: 'Credenciais inválidas'
      });
    }

    // 🔥 REATIVA A CONTA AUTOMATICAMENTE NO LOGIN
    if (!user.isActive) {
      console.log(`🔄 Reativando conta: ${user.email}`);
      user.isActive = true;
      user.deactivatedAt = null;
      await user.save();
    }

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: user.type,
        role: user.role,
        avatar: user.avatar,
        isAvailableAsProvider: user.isAvailableAsProvider,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: error.message
    });
  }
};

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

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

// @desc    Atualizar senha
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Verificar senha atual
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false,
        message: 'Senha atual incorreta'
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar senha',
      error: error.message
    });
  }
};

// @desc    Solicitar reset de senha
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Por segurança, não revelar se o email existe
      return res.json({ success: true,
        message: 'Se o email existir, você receberá instruções de redefinição de senha.'
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Salvar token e expiração no usuário
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutos
    await user.save();

    // URL de reset (em produção, enviar por email)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    console.log('🔑 Token de reset gerado:', resetUrl);

    // TODO: Enviar email com o link
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Redefinição de Senha',
    //   html: `<p>Clique no link para redefinir sua ? senha : <a href="${resetUrl}">${resetUrl}</a></p>`
    // });

    res.json({
      success: true,
      message: 'Se o email existir, você receberá instruções de redefinição de senha.',
      // Em desenvolvimento, retornar o token
      ...(process.env.NODE_ENV === 'development' && { resetToken, resetUrl })
    });
  } catch (error) {
    console.error('Erro ao solicitar reset:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação',
      error: error.message
    });
  }
};

// @desc    Resetar senha com token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false,
        message: 'Senha deve ter no mínimo 6 caracteres'
      });
    }

    // Hash do token para comparar
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuário com token válido
    const user = await User.findOne({ resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Atualizar senha
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Gerar novo token de autenticação
    const authToken = generateToken(user._id);

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso!',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type
      }
    });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao redefinir senha',
      error: error.message
    });
  }
};
