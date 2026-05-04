const env = (globalThis as any)?.process?.env ?? {};
const defaultOrigins = [
  'https://app.saldoverde.pro',
  'https://www.app.saldoverde.pro',
  'https://saldoverde.pro',
  'https://www.saldoverde.pro',
];

const configuredOrigins = [
  env.FRONTEND_ORIGIN,
  ...String(env.FRONTEND_ORIGINS ?? '')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean),
];

if (configuredOrigins.length === 0) {
  console.warn('[_http] FRONTEND_ORIGIN/FRONTEND_ORIGINS are not set — using safe production defaults for CORS.');
}

const allowedOrigins = new Set(configuredOrigins.length > 0 ? configuredOrigins : defaultOrigins);

const getCorsOrigin = (req?: any) => {
  const requestOrigin = req?.headers?.origin;
  if (typeof requestOrigin === 'string' && allowedOrigins.has(requestOrigin)) {
    return requestOrigin;
  }

  return configuredOrigins[0] ?? defaultOrigins[0];
};

export const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
  Vary: 'Origin',
  'Cache-Control': 'no-store',
});

export function sendJson(res: any, status: number, body: unknown) {
  const req = res.req;
  res.setHeader('Access-Control-Allow-Origin', getCorsOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

export function handleOptions(req: any, res: any): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', getCorsOrigin(req));
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Cache-Control', 'no-store');
  res.status(204).end();
  return true;
}
