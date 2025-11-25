import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Não autorizado - Token não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado - Token inválido'
    });
  }
};

// Middleware para verificar tipo de usuário
// ADMIN TEM ACESSO A TUDO!
export const authorize = (...types) => {
  return (req, res, next) => {
    // Admin bypassa todas as verificações de tipo
    if (req.user.type === 'admin' || req.user.role === 'admin') {
      return next();
    }
    
    if (!types.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: `Tipo de usuário ${req.user.type} não tem permissão para acessar esta rota`
      });
    }
    next();
  };
};

// Middleware específico para admin
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Apenas administradores podem acessar esta rota'
    });
  }
  next();
};
