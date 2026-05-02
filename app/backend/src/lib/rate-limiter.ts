import type { Request, Response, NextFunction } from 'express';

const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 30;
const rateMap = new Map<string, { count: number; firstRequestAt: number }>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry) {
    rateMap.set(key, { count: 1, firstRequestAt: now });
    return next();
  }

  if (now - entry.firstRequestAt > rateLimitWindowMs) {
    rateMap.set(key, { count: 1, firstRequestAt: now });
    return next();
  }

  if (entry.count >= rateLimitMax) {
    res.setHeader('Retry-After', String(Math.ceil((rateLimitWindowMs - (now - entry.firstRequestAt)) / 1000)));
    return res.status(429).json({ error: 'Erro inesperado, tente novamente mais tarde.' });
  }

  entry.count += 1;
  rateMap.set(key, entry);
  next();
}
