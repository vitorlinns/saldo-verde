import { createSupabaseClient } from '../_supabase';
import { handleOptions, sendJson } from '../_http';
import { consumeRateLimit } from '../../src/lib/rate-limiter';
import { getClientIp } from '../auth/_cookies';
import { createRecoveryEntry } from '../../src/lib/recovery';
import { sendRecoveryEmail } from '../../src/lib/email';

const RECOVER_REQUEST_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RECOVER_REQUEST_RATE_LIMIT_MAX = 5;

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const { email } = req.body ?? {};
  if (!isValidEmail(email)) {
    return sendJson(res, 400, { error: 'Email inválido.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rateLimitKey = `${getClientIp(req)}:${normalizedEmail}`;
  const rateLimitResult = consumeRateLimit('serverless-recover-request', rateLimitKey, {
    windowMs: RECOVER_REQUEST_RATE_LIMIT_WINDOW_MS,
    max: RECOVER_REQUEST_RATE_LIMIT_MAX,
  });

  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds));
    return sendJson(res, 429, {
      error: 'Muitas tentativas de recuperação. Aguarde alguns minutos antes de tentar novamente.',
    });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[recover/request] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de recuperação indisponível no momento.' });
  }

  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    return sendJson(res, 500, { error: 'Erro ao verificar usuário.' });
  }

  const entry = createRecoveryEntry(normalizedEmail);

  if (userData) {
    try {
      await sendRecoveryEmail(normalizedEmail, entry.code);
    } catch (err) {
      console.error('[recover/request] Failed to send recovery email:', err);
      return sendJson(res, 500, { error: 'Não foi possível enviar o email de recuperação.' });
    }
  }

  return sendJson(res, 200, {
    message: 'Se o email existir, você receberá as instruções para recuperação.',
  });
}
