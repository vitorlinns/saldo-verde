const frontendOrigin = ((globalThis as any)?.process?.env?.FRONTEND_ORIGIN as string | undefined);
if (!frontendOrigin) {
  console.warn('[_http] FRONTEND_ORIGIN is not set — CORS will be restrictive. Set this env var in production.');
}
const corsOrigin = frontendOrigin ?? 'https://app.saldoverde.pro';

export const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': corsOrigin,
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
});

export function sendJson(res: any, status: number, body: unknown) {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

export function handleOptions(req: any, res: any): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  res.status(204).end();
  return true;
}
