// backend/src/middlewares/validation.js
import { body, param, query, validationResult } from 'express-validator';

// Middleware para processar erros de validação
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// VALIDAÇÕES DE AUTENTICAÇÃO
export const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .escape(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .matches(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/)
    .withMessage('Telefone inválido. Use formato: (21) 99999-9999'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter letras maiúsculas, minúsculas e números'),
  
  body('type')
    .isIn(['client', 'provider', 'company'])
    .withMessage('Tipo de usuário inválido'),
  
  body('cnpj')
    .optional()
    .matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .withMessage('CNPJ inválido'),
  
  validate
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  validate
];

// VALIDAÇÕES DE SERVIÇO

export const validateServiceRequest = [
  body('providerId')
    .isMongoId()
    .withMessage('ID do prestador inválido'),
  
  body('category')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Categoria inválida'),
  
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres')
    .escape(),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres')
    .escape(),
  
  body('location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Localização inválida')
    .escape(),
  
  body('requestedDate')
    .isISO8601()
    .withMessage('Data inválida')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Data não pode ser no passado');
      }
      return true;
    }),
  
  body('estimatedHours')
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('Horas estimadas devem estar entre 0.5 e 100'),
  
  validate
];

// VALIDAÇÕES DE VAGA

export const validateJobCreation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Título deve ter entre 5 e 200 caracteres')
    .escape(),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Descrição deve ter entre 20 e 5000 caracteres')
    .escape(),
  
  body('category')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Categoria inválida'),
  
  body('type')
    .isIn(['temporary', 'trial', 'permanent'])
    .withMessage('Tipo de vaga inválido'),
  
  body('salary')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Salário deve ser um valor positivo'),
  
  body('location')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Localização inválida')
    .escape(),
  
  body('vacancies')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Número de vagas deve estar entre 1 e 1000'),
  
  validate
];

// VALIDAÇÕES DE PARÂMETROS

export const validateMongoId = [
  param('id')
    .isMongoId()
    .withMessage('ID inválido'),
  
  validate
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve estar entre 1 e 100'),
  
  validate
];