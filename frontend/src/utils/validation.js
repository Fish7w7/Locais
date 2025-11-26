// frontend/src/utils/validation.js

// ===================================
// VALIDAÇÕES GERAIS
// ===================================

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
  return regex.test(phone);
};

export const validateCNPJ = (cnpj) => {
  const regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  return regex.test(cnpj);
};

export const validatePassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: 'Senha deve ter no mínimo 6 caracteres' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter letras minúsculas' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter letras maiúsculas' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Senha deve conter números' };
  }
  
  return { valid: true, message: 'Senha válida' };
};

// ===================================
// SANITIZAÇÃO
// ===================================

export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return String(input)
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// ===================================
// VALIDAÇÕES DE FORMULÁRIO
// ===================================

export const validateRegisterForm = (data) => {
  const errors = {};

  // Nome
  if (!data.name || data.name.trim().length < 3) {
    errors.name = 'Nome deve ter no mínimo 3 caracteres';
  }

  // Email
  if (!data.email || !validateEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  // Telefone
  if (!data.phone || !validatePhone(data.phone)) {
    errors.phone = 'Telefone inválido. Use formato: (21) 99999-9999';
  }

  // Senha
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.message;
  }

  // Confirmar senha
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'As senhas não coincidem';
  }

  // CNPJ (se empresa)
  if (data.type === 'company' && data.cnpj && !validateCNPJ(data.cnpj)) {
    errors.cnpj = 'CNPJ inválido';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateServiceForm = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Título deve ter no mínimo 5 caracteres';
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Descrição deve ter no mínimo 10 caracteres';
  }

  if (!data.location || data.location.trim().length < 5) {
    errors.location = 'Localização inválida';
  }

  if (!data.requestedDate) {
    errors.requestedDate = 'Data é obrigatória';
  } else {
    const date = new Date(data.requestedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      errors.requestedDate = 'Data não pode ser no passado';
    }
  }

  if (!data.estimatedHours || data.estimatedHours < 0.5) {
    errors.estimatedHours = 'Horas estimadas devem ser no mínimo 0.5';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateJobForm = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Título deve ter no mínimo 5 caracteres';
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.description = 'Descrição deve ter no mínimo 20 caracteres';
  }

  if (!data.category) {
    errors.category = 'Categoria é obrigatória';
  }

  if (!data.location || data.location.trim().length < 3) {
    errors.location = 'Localização inválida';
  }

  if (data.salary && data.salary < 0) {
    errors.salary = 'Salário deve ser positivo';
  }

  if (!data.vacancies || data.vacancies < 1) {
    errors.vacancies = 'Número de vagas deve ser no mínimo 1';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// ===================================
// MÁSCARAS DE INPUT
// ===================================

export const maskPhone = (value) => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  }
  
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

export const maskCNPJ = (value) => {
  if (!value) return '';
  
  const numbers = value.replace(/\D/g, '');
  
  return numbers.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
};

// ===================================
// HELPERS
// ===================================

export const hasError = (errors, field) => {
  return errors && errors[field];
};

export const getErrorMessage = (errors, field) => {
  return errors && errors[field] ? errors[field] : '';
};