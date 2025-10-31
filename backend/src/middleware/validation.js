// VALIDATION MIDDLEWARE

const { body, param, query, validationResult } = require('express-validator');

// Middleware para verificar erros de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erros de validação',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// VALIDAÇÕES PARA SERVICE REQUEST

exports.validateCreateRequest = [
  body('providerId')
    .notEmpty().withMessage('ID do prestador é obrigatório')
    .isMongoId().withMessage('ID do prestador inválido'),
  
  body('category')
    .notEmpty().withMessage('Categoria é obrigatória')
    .isIn([
      'Eletricista', 'Encanador', 'Pintor', 'Diarista',
      'Mecânico', 'Manicure', 'Cabeleireiro', 'Confeiteiro',
      'Pedreiro', 'Professor', 'Pet Sitter', 'Técnico TI',
      'Lavador de Carros', 'Jardineiro', 'Fotógrafo',
      'Músico', 'Personal Trainer', 'Outro'
    ]).withMessage('Categoria inválida'),
  
  body('title')
    .notEmpty().withMessage('Título é obrigatório')
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Título deve ter entre 5 e 100 caracteres'),
  
  body('description')
    .notEmpty().withMessage('Descrição é obrigatória')
    .isLength({ min: 10, max: 1000 }).withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  
  body('location.address')
    .notEmpty().withMessage('Endereço é obrigatório'),
  
  body('location.city')
    .notEmpty().withMessage('Cidade é obrigatória'),
  
  body('location.state')
    .notEmpty().withMessage('Estado é obrigatório')
    .isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres (UF)'),
  
  body('requestedDate')
    .notEmpty().withMessage('Data solicitada é obrigatória')
    .isISO8601().withMessage('Data inválida')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Data não pode ser no passado');
      }
      return true;
    }),
  
  body('estimatedDuration')
    .optional()
    .isFloat({ min: 0.5, max: 24 }).withMessage('Duração deve estar entre 0.5 e 24 horas'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Preço não pode ser negativo'),
  
  validate
];

exports.validateAcceptRequest = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  body('negotiatedPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Preço negociado não pode ser negativo'),
  
  validate
];

exports.validateRejectRequest = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  body('reason')
    .optional()
    .isLength({ max: 500 }).withMessage('Motivo muito longo (máx 500 caracteres)'),
  
  validate
];

exports.validateCancelRequest = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  body('reason')
    .notEmpty().withMessage('Motivo do cancelamento é obrigatório')
    .isLength({ min: 10, max: 500 }).withMessage('Motivo deve ter entre 10 e 500 caracteres'),
  
  validate
];

exports.validateReview = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  body('rating')
    .notEmpty().withMessage('Avaliação é obrigatória')
    .isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  
  body('review')
    .optional()
    .isLength({ max: 500 }).withMessage('Comentário muito longo (máx 500 caracteres)'),
  
  validate
];

exports.validateGetRequests = [
  query('status')
    .optional()
    .isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'])
    .withMessage('Status inválido'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve estar entre 1 e 100'),
  
  validate
];

exports.validateRequestId = [
  param('id')
    .isMongoId().withMessage('ID inválido'),
  
  validate
];