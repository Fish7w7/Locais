import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import JobVacancy from '../models/JobVacancy.js';

export const anonymizeUserAccount = async (user) => {
  const userId = user._id;
  const deletedAt = new Date();
  const hashSecret = process.env.JWT_SECRET || 'servicos-locais';
  const deletedEmailHash = crypto
    .createHmac('sha256', hashSecret)
    .update(String(user.email || '').toLowerCase())
    .digest('hex');
  const anonymizedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

  await Promise.all([
    JobVacancy.updateMany(
      { companyId: userId },
      { $set: { isActive: false } }
    ),
    User.updateOne(
      { _id: userId },
      {
        $set: {
          name: 'Usuario excluido',
          email: `deleted-${userId}@deleted.local`,
          phone: 'Conta excluida',
          password: anonymizedPassword,
          avatar: null,
          type: user.type,
          role: user.role,
          providerRating: 0,
          providerReviewCount: 0,
          clientRating: 0,
          clientReviewCount: 0,
          category: null,
          pricePerHour: null,
          portfolio: [],
          isAvailableAsProvider: false,
          description: null,
          companyDescription: null,
          city: null,
          state: null,
          resetPasswordToken: null,
          resetPasswordExpire: null,
          isActive: false,
          deactivatedAt: deletedAt,
          isDeleted: true,
          deletedAt,
          deletedEmailHash
        },
        $unset: {
          cnpj: ''
        }
      },
      { runValidators: false }
    )
  ]);

  return {
    userId,
    deletedAt,
    deletedEmailHash
  };
};
