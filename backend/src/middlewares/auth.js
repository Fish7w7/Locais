import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const debugLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false,
        message: 'Nao autorizado - Token nao fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false,
        message: 'Usuario nao encontrado'
      });
    }

    if (req.user.isDeleted === true) {
      return res.status(403).json({ success: false,
        message: 'Conta excluida.'
      });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({ success: false,
        message: 'Conta desativada. Faca login novamente para reativa-la.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false,
      message: 'Nao autorizado - Token invalido'
    });
  }
};

export const authorize = (...types) => {
  return (req, res, next) => {
    if (req.user.type === 'admin' || req.user.role === 'admin') {
      debugLog('Admin bypass - Acesso concedido');
      return next();
    }

    if (!types.includes(req.user.type)) {
      debugLog(`Acesso negado: usuario ${req.user.type} tentou acessar rota [${types.join(', ')}]`);
      return res.status(403).json({ success: false,
        message: `Tipo de usuario ${req.user.type} nao tem permissao para acessar esta rota`
      });
    }

    debugLog(`Acesso concedido: ${req.user.type}`);
    next();
  };
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.type !== 'admin') {
    return res.status(403).json({ success: false,
      message: 'Apenas administradores podem acessar esta rota'
    });
  }
  next();
};
