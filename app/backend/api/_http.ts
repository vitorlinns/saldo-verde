export const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.FRONTEND_ORIGIN ?? '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

export function sendJson(res: any, status: number, body: unknown) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res.status(status).json(body);
}

export function handleOptions(req: any, res: any): boolean {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
  return true;
}
