import { handleOptions, sendJson } from './_http';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  return sendJson(res, 200, { message: 'Logout realizado com sucesso.' });
}
