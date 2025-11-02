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

export const authorize = (...types) => {
  return (req, res, next) => {
    if (!types.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: `Tipo de usuário ${req.user.type} não tem permissão para acessar esta rota`
      });
    }
    next();
  };
};