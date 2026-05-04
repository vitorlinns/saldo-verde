import { handleOptions, sendJson } from '../_http';
import { verifyRecoveryCode } from '../../src/lib/recovery';

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const { email, code } = req.body ?? {};

  if (!isValidEmail(email) || typeof code !== 'string') {
    return sendJson(res, 400, { error: 'Email ou código inválidos.' });
  }

  if (!verifyRecoveryCode(email.toLowerCase(), code.trim())) {
    return sendJson(res, 400, { error: 'Código inválido ou expirado.' });
  }

  return sendJson(res, 200, { message: 'Código de recuperação verificado.' });
}
