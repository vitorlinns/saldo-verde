import { createSupabaseClient } from '../_supabase';
import { handleOptions, sendJson } from '../_http';
import { getAccessTokenFromRequest, getClientIp } from './_cookies';
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
    console.error('[auth/sessions] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de autenticação indisponível no momento.' });
  }

  const { data: userData, error: userError } = await authGetUser(supabase.auth, accessToken);
  if (userError || !userData?.user) {
    return sendJson(res, 401, { error: 'Sessão inválida.' });
  }

  const clientIp = getClientIp(req);

  const { data, error } = await supabase
    .from('auth.sessions')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('ip_address', clientIp)
    .gt('not_after', new Date().toISOString());

  if (error) {
    console.error('[auth/sessions] count error:', error);
    return sendJson(res, 500, { error: 'Não foi possível contar as sessões ativas.' });
  }

  return sendJson(res, 200, { count: Array.isArray(data) ? data.length : 0 });
}
