import { createSupabaseClient } from '../_supabase';
import { handleOptions, sendJson } from '../_http';
import { clearAuthCookies, getAccessTokenFromRequest } from './_cookies';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const accessToken = getAccessTokenFromRequest(req);

  if (accessToken) {
    try {
      const supabase = createSupabaseClient();
      const { data: userData } = await supabase.auth.getUser(accessToken);
      if (userData?.user?.id) {
        await supabase.auth.admin.signOut(userData.user.id);
      }
    } catch (error) {
      console.warn('[auth/logout] admin signOut failed:', error);
    }
  }

  clearAuthCookies(res);
  return sendJson(res, 200, { message: 'Logout realizado com sucesso.' });
}
