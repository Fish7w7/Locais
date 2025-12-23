// backend/src/middlewares/maintenance.js
import Settings from '../models/Settings.js';

// Cache do modo de manutenção
let maintenanceCache = {
  isActive: false,
  lastCheck: 0
};

const CACHE_DURATION = 10000; // 10 segundos

export const checkMaintenance = async (req, res, next) => {
  try {
    // Rotas que NUNCA são bloqueadas
    const allowedPaths = [
      '/',
      '/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/me',
      '/api/admin'
    ];

    // Verifica se a rota atual é permitida
    const isAllowedPath = allowedPaths.some(path => req.path.startsWith(path));
    if (isAllowedPath) {
      return next();
    }

    // Bypass para admins (verifica token)
    if (req.user && (req.user.role === 'admin' || req.user.type === 'admin')) {
      return next();
    }

    // Verifica cache
    const now = Date.now();
    if (now - maintenanceCache.lastCheck > CACHE_DURATION) {
      try {
        const settings = await Settings.findOne();
        maintenanceCache = {
          isActive: settings?.maintenanceMode || false,
          lastCheck: now
        };
      } catch (error) {
        console.error('❌ Erro ao verificar modo manutenção:', error);
        // Em caso de erro, permite acesso
        maintenanceCache = {
          isActive: false,
          lastCheck: now
        };
      }
    }

    // Se modo manutenção estiver ativo, bloqueia
    if (maintenanceCache.isActive) {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: '🔧 Sistema em manutenção. Tente novamente em alguns minutos.',
        timestamp: new Date().toISOString()
      });
    }

    next();
  } catch (error) {
    console.error('❌ Erro crítico no middleware de manutenção:', error);
    // Em caso de erro crítico, permite acesso
    next();
  }
};

// Função para forçar atualização do cache
export const refreshMaintenanceCache = async () => {
  try {
    const settings = await Settings.findOne();
    maintenanceCache = {
      isActive: settings?.maintenanceMode || false,
      lastCheck: Date.now()
    };
    console.log('🔄 Cache de manutenção atualizado:', maintenanceCache);
    return maintenanceCache;
  } catch (error) {
    console.error('❌ Erro ao atualizar cache:', error);
    return null;
  }
};