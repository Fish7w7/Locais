import { Resend } from 'resend';

const isProduction = process.env.NODE_ENV === 'production';

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const hasEmailConfig = () => Boolean(
  process.env.RESEND_API_KEY &&
  process.env.RESEND_FROM
);

const getResendClient = () => {
  if (!hasEmailConfig()) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
};

const normalizeResendError = (error) => {
  if (!error) {
    return 'Erro desconhecido do Resend';
  }

  if (typeof error === 'string') {
    return error;
  }

  return error.message || error.name || 'Falha ao enviar email pelo Resend';
};

export const sendEmail = async ({ to, subject, text, html }) => {
  const resend = getResendClient();

  if (!resend) {
    if (isProduction) {
      throw new Error('Resend nao configurado para envio de email');
    }

    return { skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to,
    subject,
    text,
    html
  });

  if (error) {
    throw new Error(normalizeResendError(error));
  }

  return { sent: true, id: data?.id };
};

export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
  const displayName = name || 'usuario';
  const safeDisplayName = escapeHtml(displayName);
  const safeResetUrl = escapeHtml(resetUrl);

  return sendEmail({
    to,
    subject: 'Redefinicao de senha - Servicos Locais',
    text: [
      `Ola, ${displayName}.`,
      '',
      'Recebemos uma solicitacao para redefinir sua senha.',
      'Use o link abaixo em ate 30 minutos:',
      resetUrl,
      '',
      'Se voce nao solicitou essa alteracao, ignore este email.'
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2>Redefinicao de senha</h2>
        <p>Ola, ${safeDisplayName}.</p>
        <p>Recebemos uma solicitacao para redefinir sua senha.</p>
        <p>
          <a href="${safeResetUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 16px; border-radius: 6px; text-decoration: none;">
            Redefinir senha
          </a>
        </p>
        <p>Este link expira em 30 minutos.</p>
        <p>Se voce nao solicitou essa alteracao, ignore este email.</p>
      </div>
    `
  });
};
