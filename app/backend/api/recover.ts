import { createSupabaseClient } from './_supabase';
import { handleOptions, sendJson } from './_http';
import { consumeRateLimit } from '../src/lib/rate-limiter';
import { getClientIp } from './auth/_cookies';
import {
  createRecoveryEntry,
  getRecoveryEntry,
  verifyRecoveryCode,
  consumeRecoveryEntry,
} from '../src/lib/recovery';
import { sendRecoveryEmail } from '../src/lib/email';

const RECOVER_REQUEST_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RECOVER_REQUEST_RATE_LIMIT_MAX = 5;
const RECOVER_RESET_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RECOVER_RESET_RATE_LIMIT_MAX = 5;

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const getActionFromUrl = (url?: string) => {
  if (!url) return null;
  const pathname = new URL(url, 'http://localhost').pathname;
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : null;
};

const findUserIdByEmail = async (supabase: any, email: string): Promise<string | null> => {
  let page = 1;
  const normalizedEmail = email.toLowerCase();

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      throw error;
    }

    const users = Array.isArray(data?.users) ? data.users : [];
    const found = users.find(
      (user: any) => typeof user.email === 'string' && user.email.toLowerCase() === normalizedEmail
    );

    if (found?.id) {
      return found.id;
    }

    const nextPage = typeof data?.nextPage === 'number' ? data.nextPage : null;
    const lastPage = typeof data?.lastPage === 'number' ? data.lastPage : null;

    if (!nextPage || (lastPage !== null && page >= lastPage)) {
      return null;
    }

    page += 1;
  }
};

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  const action = getActionFromUrl(req.url);
  if (!action || !['request', 'verify', 'reset'].includes(action)) {
    return sendJson(res, 404, { error: 'Endpoint não encontrado.' });
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const body = req.body ?? {};

  if (action === 'request') {
    const { email } = body;
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
      console.error('[recover] supabase init error:', error);
      return sendJson(res, 503, { error: 'Serviço de recuperação indisponível no momento.' });
    }

    let userId: string | null = null;
    try {
      userId = await findUserIdByEmail(supabase, normalizedEmail);
    } catch (error) {
      console.error('[recover] findUserIdByEmail error:', error);
      return sendJson(res, 500, { error: 'Erro ao verificar usuário.' });
    }

    const entry = createRecoveryEntry(normalizedEmail);

    if (userId) {
      try {
        await sendRecoveryEmail(normalizedEmail, entry.code);
      } catch (err) {
        console.error('[recover] Failed to send recovery email:', err);
        return sendJson(res, 500, { error: 'Não foi possível enviar o email de recuperação.' });
      }
    }

    return sendJson(res, 200, {
      message: 'Se o email existir, você receberá as instruções para recuperação.',
    });
  }

  if (action === 'verify') {
    const { email, code } = body;
    if (!isValidEmail(email) || typeof code !== 'string') {
      return sendJson(res, 400, { error: 'Email ou código inválidos.' });
    }

    if (!verifyRecoveryCode(email.toLowerCase(), code.trim())) {
      return sendJson(res, 400, { error: 'Código inválido ou expirado.' });
    }

    return sendJson(res, 200, { message: 'Código de recuperação verificado.' });
  }

  if (action === 'reset') {
    const { email, code, password } = body;
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
      console.error('[recover] supabase init error:', error);
      return sendJson(res, 503, { error: 'Serviço de recuperação indisponível no momento.' });
    }

    let userId: string | null = null;
    try {
      userId = await findUserIdByEmail(supabase, email.toLowerCase());
    } catch (error) {
      console.error('[recover] findUserIdByEmail error:', error);
      return sendJson(res, 400, { error: 'Não foi possível encontrar o usuário.' });
    }

    if (!userId) {
      return sendJson(res, 400, { error: 'Usuário não encontrado.' });
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
    });

    if (error) {
      console.error('[recover] Failed to reset password:', error);
      return sendJson(res, 500, { error: 'Não foi possível redefinir a senha.' });
    }

    consumeRecoveryEntry(email.toLowerCase());
    return sendJson(res, 200, { message: 'Senha redefinida com sucesso.' });
  }

  return sendJson(res, 404, { error: 'Endpoint não encontrado.' });
}
