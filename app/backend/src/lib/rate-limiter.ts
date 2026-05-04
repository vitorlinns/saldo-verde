const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 30;
const rateMap = new Map<string, { count: number; firstRequestAt: number }>();
const namedRateMaps = new Map<string, Map<string, { count: number; firstRequestAt: number }>>();

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

function getNamedRateMap(name: string) {
  const existing = namedRateMaps.get(name);
  if (existing) {
    return existing;
  }

  const next = new Map<string, { count: number; firstRequestAt: number }>();
  namedRateMaps.set(name, next);
  return next;
}

export function consumeRateLimit(name: string, key: string, options: RateLimitOptions): RateLimitResult {
  const scopedRateMap = getNamedRateMap(name);
  const now = Date.now();
  const entry = scopedRateMap.get(key);

  if (!entry) {
    scopedRateMap.set(key, { count: 1, firstRequestAt: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (now - entry.firstRequestAt > options.windowMs) {
    scopedRateMap.set(key, { count: 1, firstRequestAt: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= options.max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((options.windowMs - (now - entry.firstRequestAt)) / 1000),
    };
  }

  entry.count += 1;
  scopedRateMap.set(key, entry);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimiter(req: any, res: any, next: any) {
  const path = typeof req.path === 'string' ? req.path : '';
  const bypassPaths = [
    '/login',
    '/auth/login',
    '/register',
    '/auth/refresh',
    '/auth/logout',
    '/auth/me',
    '/auth/sessions',
    '/recover/request',
    '/recover/verify',
    '/recover/reset',
  ];

  if (bypassPaths.includes(path)) {
    return next();
  }

  const key = req.ip || 'unknown';
  const result = consumeRateLimit('global', key, {
    windowMs: rateLimitWindowMs,
    max: rateLimitMax,
  });

  if (!result.allowed) {
    res.setHeader('Retry-After', String(result.retryAfterSeconds));
    return res.status(429).json({ error: 'Muitas requisições. Aguarde alguns instantes e tente novamente.' });
  }

  next();
}
