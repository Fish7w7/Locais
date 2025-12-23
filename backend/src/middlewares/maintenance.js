// backend/src/middlewares/maintenance.js
import Settings from '../models/Settings.js';

// Cache do modo de manutenção (atualiza a cada 30 segundos)
let maintenanceCache = {
  isActive: false,
  lastCheck: Date.now()
};

const CACHE_DURATION = 30000; // 30 segundos

export const checkMaintenance = async (req, res, next) => {
  try {
    // Bypass para admins
    if (req.user && (req.user.role === 'admin' || req.user.type === 'admin')) {
      return next();
    }

    // Bypass para rotas de admin e auth
    if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
      return next();
    }

    // Verifica cache
    const now = Date.now();
    if (now - maintenanceCache.lastCheck > CACHE_DURATION) {
      const settings = await Settings.findOne();
      maintenanceCache = {
        isActive: settings?.maintenanceMode || false,
        lastCheck: now
      };
    }

    // Se modo manutenção estiver ativo, bloqueia
    if (maintenanceCache.isActive) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: '🔧 Sistema em manutenção. Tente novamente em alguns minutos.'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Erro ao verificar modo manutenção:', error);
    // Em caso de erro, permite acesso
    next();
  }
};