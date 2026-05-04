import { createSupabaseClient } from '../_supabase';
import { handleOptions, sendJson } from '../_http';
import { consumeRateLimit } from '../../src/lib/rate-limiter';
import { getClientIp } from '../auth/_cookies';
import { getRecoveryEntry, consumeRecoveryEntry } from '../../src/lib/recovery';

const RECOVER_RESET_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RECOVER_RESET_RATE_LIMIT_MAX = 5;

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const { email, code, password } = req.body ?? {};

  if (!isValidEmail(email) || typeof code !== 'string' || typeof password !== 'string') {
    return sendJson(res, 400, { error: 'Dados inválidos.' });
  }

  if (password.length < 8) {
    return sendJson(res, 400, { error: 'A senha deve ter ao menos 8 caracteres.' });
  }

  const rateLimitKey = `${getClientIp(req)}:${email.toLowerCase()}`;
  const rateLimitResult = consumeRateLimit('serverless-recover-reset', rateLimitKey, {
    windowMs: RECOVER_RESET_RATE_LIMIT_WINDOW_MS,
    max: RECOVER_RESET_RATE_LIMIT_MAX,
  });

  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds));
    return sendJson(res, 429, {
      error: 'Muitas tentativas de redefinição. Aguarde alguns minutos antes de tentar novamente.',
    });
  }

  const entry = getRecoveryEntry(email.toLowerCase());
  if (!entry || entry.code !== code.trim() || entry.expiresAt < Date.now()) {
    return sendJson(res, 400, { error: 'Código inválido ou expirado.' });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[recover/reset] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de recuperação indisponível no momento.' });
  }

  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();

  if (userError) {
    return sendJson(res, 400, { error: 'Não foi possível encontrar o usuário.' });
  }

  if (!userData?.id) {
    return sendJson(res, 400, { error: 'Usuário não encontrado.' });
  }

  const { error } = await supabase.auth.admin.updateUserById(userData.id, {
    password,
  });

  if (error) {
    console.error('[recover/reset] Failed to reset password:', error);
    return sendJson(res, 500, { error: 'Não foi possível redefinir a senha.' });
  }

  consumeRecoveryEntry(email.toLowerCase());
  return sendJson(res, 200, { message: 'Senha redefinida com sucesso.' });
}
