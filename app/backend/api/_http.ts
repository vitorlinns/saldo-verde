const frontendOrigin = ((globalThis as any)?.process?.env?.FRONTEND_ORIGIN as string | undefined) ?? '*';

export const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': frontendOrigin,
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'no-store',
});

export function sendJson(res: any, status: number, body: unknown) {
  res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(body);
}

export function handleOptions(req: any, res: any): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', frontendOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  res.status(204).end();
  return true;
}
