import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Генерация CSRF токена
const generateCSRFToken = (): string => crypto.randomBytes(32).toString('hex');

// Middleware для установки CSRF токена
export const setCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.cookies['x-csrf-token']) {
    const token = generateCSRFToken();
    res.cookie('x-csrf-token', token, {
      httpOnly: false, // Доступен из JS для отправки в headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 часа
    });
  }
  next();
};

// Middleware для проверки CSRF токена
export const verifyCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
  // Маршруты, исключенные из CSRF защиты
  const excludedPaths = [
    '/auth',
    '/order',
    '/upload', 
    '/customers',
    '/product'
  ];

  // Методы, требующие CSRF защиты
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  // Проверяем, нужно ли применять CSRF защиту
  const shouldApplyCSRF = 
    protectedMethods.includes(req.method) &&
    !excludedPaths.some(path => req.path.startsWith(path));

  if (!shouldApplyCSRF) {
    return next();
  }

  const cookieToken = req.cookies['x-csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ 
      message: 'Invalid CSRF token' 
    });
    return;
  }

  next();
};

// Комбинированный middleware для удобства
export const csrfProtection = [setCSRFToken, verifyCSRFToken];