export const devOnly = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: '🚫 Esta rota está disponível apenas em desenvolvimento'
    });
  }
  next();
};