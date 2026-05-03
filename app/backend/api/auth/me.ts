import { createSupabaseClient } from '../_supabase';
import { handleOptions, sendJson } from '../_http';
import { getAccessTokenFromRequest } from './_cookies';
import { authGetUser } from '../_auth';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const accessToken = getAccessTokenFromRequest(req);
  if (!accessToken) {
    return sendJson(res, 401, { error: 'Sessão ausente.' });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[auth/me] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de autenticação indisponível no momento.' });
  }

  const { data, error } = await authGetUser(supabase.auth, accessToken);

  if (error || !data.user) {
    return sendJson(res, 401, { error: 'Sessão inválida.' });
  }

  return sendJson(res, 200, { user: data.user, authenticated: true });
}
