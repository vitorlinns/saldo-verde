import { createSupabaseClient } from '../_supabase';
import { handleOptions, sendJson } from '../_http';
import { consumeRateLimit } from '../../src/lib/rate-limiter';
import { getClientIp, setAuthCookies } from './_cookies';

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 10;

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const { email, password } = req.body ?? {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return sendJson(res, 400, { error: 'E-mail e senha são obrigatórios.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rateLimitKey = `${getClientIp(req)}:${normalizedEmail}`;
  const rateLimitResult = consumeRateLimit('serverless-auth-login-v2', rateLimitKey, {
    windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
    max: LOGIN_RATE_LIMIT_MAX,
  });

  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds));
    return sendJson(res, 429, { error: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.' });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[auth/login] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de login indisponível no momento.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    return sendJson(res, 401, { error: 'E-mail ou senha inválidos.' });
  }

  if (!data.session || !data.user) {
    return sendJson(res, 401, { error: 'Não foi possível autenticar o usuário.' });
  }

  setAuthCookies(res, data.session.access_token, data.session.refresh_token);

  return sendJson(res, 200, {
    session: data.session,
    user: data.user,
    message: 'Login realizado com sucesso.',
  });
}
