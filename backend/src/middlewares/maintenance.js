// backend/src/middlewares/maintenance.js
import Settings from '../models/Settings.js';

let maintenanceCache = {
  isActive: false,
  lastCheck: 0
};

const CACHE_DURATION = 5000;

const debugLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

export const checkMaintenance = async (req, res, next) => {
  try {
    const allowedPaths = [
      '/auth/login',
      '/auth/register',
      '/admin'
    ];

    const path = req.path.replace('/api', '');
    const isAllowedPath = allowedPaths.some(allowedPath => path.startsWith(allowedPath));

    if (isAllowedPath) {
      debugLog(`Rota permitida (bypass manutencao): ${req.path}`);
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(decoded.id).select('role type email');

        if (user && (user.role === 'admin' || user.type === 'admin')) {
          debugLog(`Admin detectado, bypass de manutencao: ${user.email}`);
          return next();
        }
      } catch (error) {
        debugLog(`Token invalido ou erro: ${error.message}`);
      }
    }

    const now = Date.now();
    if (now - maintenanceCache.lastCheck > CACHE_DURATION) {
      try {
        const settings = await Settings.findOne();
        maintenanceCache = {
          isActive: settings?.maintenanceMode || false,
          lastCheck: now
        };
        debugLog('Cache de manutencao atualizado:', maintenanceCache.isActive ? 'ATIVO' : 'INATIVO');
      } catch (error) {
        console.error('Erro ao verificar modo manutencao:', error);
        maintenanceCache = {
          isActive: false,
          lastCheck: now
        };
      }
    }

    if (maintenanceCache.isActive) {
      debugLog(`BLOQUEADO - Modo manutencao ativo: ${req.method} ${req.path}`);
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: 'Sistema em manutencao. Tente novamente em alguns minutos.',
        timestamp: new Date().toISOString()
      });
    }

    debugLog(`Modo manutencao inativo, permitindo: ${req.method} ${req.path}`);
    next();
  } catch (error) {
    console.error('Erro critico no middleware de manutencao:', error);
    next();
  }
};

export const refreshMaintenanceCache = async () => {
  try {
    const settings = await Settings.findOne();
    maintenanceCache = {
      isActive: settings?.maintenanceMode || false,
      lastCheck: Date.now()
    };
    debugLog('Cache de manutencao forcado:', maintenanceCache);
    return maintenanceCache;
  } catch (error) {
    console.error('Erro ao atualizar cache:', error);
    return null;
  }
};
