import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // limit each IP to 100 requests per windowMs
  message: {
    error: "Слишком много запросов с этого IP-адреса. Повторите попытку позже"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Более строгий лимит для auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // всего 5 попыток входа за 15 минут
  message: {
    error: "Слишком много попыток входа, повторите попытку позже."
  },
  standardHeaders: true,
});