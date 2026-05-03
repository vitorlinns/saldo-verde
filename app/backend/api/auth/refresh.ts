import { createSupabaseClient } from '../_supabase';
import { handleOptions, sendJson } from '../_http';
import { consumeRateLimit } from '../../src/lib/rate-limiter';
import { getClientIp, getCookie, setAuthCookies } from './_cookies';
import { authRefreshSession } from '../_auth';

const REFRESH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const REFRESH_RATE_LIMIT_MAX = 20;

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const refreshToken = getCookie(req, 'sv_rt');
  if (!refreshToken) {
    return sendJson(res, 401, { error: 'Sessão de autenticação ausente.' });
  }

  const rateLimitResult = consumeRateLimit('serverless-auth-refresh', getClientIp(req), {
    windowMs: REFRESH_RATE_LIMIT_WINDOW_MS,
    max: REFRESH_RATE_LIMIT_MAX,
  });

  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds));
    return sendJson(res, 429, { error: 'Muitas tentativas de renovação. Aguarde alguns minutos antes de tentar novamente.' });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[auth/refresh] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de autenticação indisponível no momento.' });
  }

  const { data, error } = await authRefreshSession(supabase.auth, refreshToken);

  if (error || !data.session || !data.user) {
    return sendJson(res, 401, { error: 'Sessão expirada. Faça login novamente.' });
  }

  setAuthCookies(res, data.session.access_token, data.session.refresh_token);

  return sendJson(res, 200, {
    session: data.session,
    user: data.user,
    message: 'Sessão renovada com sucesso.',
  });
}
