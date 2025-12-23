// backend/src/middlewares/maintenance.js
import Settings from '../models/Settings.js';

// Cache do modo de manutenção
let maintenanceCache = {
  isActive: false,
  lastCheck: 0
};

const CACHE_DURATION = 5000; // 5 segundos

export const checkMaintenance = async (req, res, next) => {
  try {
    // Rotas que NUNCA são bloqueadas (health checks e login)
    const allowedPaths = [
      '/auth/login',
      '/auth/register',
      '/admin'
    ];

    // Remove o prefixo /api para comparar
    const path = req.path.replace('/api', '');
    
    // Verifica se a rota atual é permitida
    const isAllowedPath = allowedPaths.some(allowedPath => path.startsWith(allowedPath));
    if (isAllowedPath) {
      console.log(`✅ Rota permitida (bypass manutenção): ${req.path}`);
      return next();
    }

    // Bypass para admins - verifica o token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(decoded.id).select('role type');
        
        if (user && (user.role === 'admin' || user.type === 'admin')) {
          console.log(`✅ Admin detectado, bypass de manutenção: ${user.email}`);
          return next();
        }
      } catch (error) {
        // Token inválido, continua verificação de manutenção
        console.log(`⚠️ Token inválido ou erro: ${error.message}`);
      }
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
        console.log('🔧 Cache de manutenção atualizado:', maintenanceCache.isActive ? 'ATIVO' : 'INATIVO');
      } catch (error) {
        console.error('❌ Erro ao verificar modo manutenção:', error);
        maintenanceCache = {
          isActive: false,
          lastCheck: now
        };
      }
    }

    // Se modo manutenção estiver ativo, bloqueia
    if (maintenanceCache.isActive) {
      console.log(`🔧 BLOQUEADO - Modo manutenção ativo: ${req.method} ${req.path}`);
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: '🔧 Sistema em manutenção. Tente novamente em alguns minutos.',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`✅ Modo manutenção inativo, permitindo: ${req.method} ${req.path}`);
    next();
  } catch (error) {
    console.error('❌ Erro crítico no middleware de manutenção:', error);
    // Em caso de erro crítico, permite acesso
    next();
  }
};

// Função para forçar atualização do cache (pode ser chamada após atualizar settings)
export const refreshMaintenanceCache = async () => {
  try {
    const settings = await Settings.findOne();
    maintenanceCache = {
      isActive: settings?.maintenanceMode || false,
      lastCheck: Date.now()
    };
    console.log('🔄 Cache de manutenção forçado:', maintenanceCache);
    return maintenanceCache;
  } catch (error) {
    console.error('❌ Erro ao atualizar cache:', error);
    return null;
  }
};