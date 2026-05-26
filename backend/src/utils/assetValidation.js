const MAX_ASSET_URL_LENGTH = 500;
const MAX_PORTFOLIO_ITEMS = 10;

const isDevelopment = process.env.NODE_ENV !== 'production';

export const normalizeAssetUrl = (value, fieldName = 'URL') => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} invalida`);
  }

  const trimmed = value.trim();

  if (trimmed.length > MAX_ASSET_URL_LENGTH) {
    throw new Error(`${fieldName} muito longa`);
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${fieldName} deve ser uma URL valida`);
  }

  const isLocalDevUrl = isDevelopment && ['localhost', '127.0.0.1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !isLocalDevUrl) {
    throw new Error(`${fieldName} deve usar HTTPS`);
  }

  return trimmed;
};

export const normalizePortfolioUrls = (value) => {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error('Portfolio deve ser uma lista de URLs');
  }

  if (value.length > MAX_PORTFOLIO_ITEMS) {
    throw new Error(`Portfolio deve ter no maximo ${MAX_PORTFOLIO_ITEMS} itens`);
  }

  return value
    .map((item, index) => normalizeAssetUrl(item, `URL do portfolio ${index + 1}`))
    .filter(Boolean);
};
