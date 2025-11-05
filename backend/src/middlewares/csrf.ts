import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Генерация CSRF токена
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

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
  const isAuthPath = req.path.startsWith('/auth/');
  const isModifyingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  
  // Пропускаем GET, HEAD, OPTIONS и аутентификационные маршруты
  if (!isModifyingMethod || isAuthPath) {
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