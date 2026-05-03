import { getBearerToken } from './_auth';
import { createSupabaseClient } from './_supabase';
import { handleOptions, sendJson } from './_http';
import { authAdminSignOut, authGetUser } from './_auth';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const token = getBearerToken(req);
  if (token) {
    try {
      const supabase = createSupabaseClient();
      const { data: userData } = await authGetUser(supabase.auth, token);
      if (userData?.user?.id) {
        await authAdminSignOut(supabase.auth, userData.user.id);
      }
    } catch (err) {
      console.warn('[logout] admin signOut failed:', err);
    }
  }

  return sendJson(res, 200, { message: 'Logout realizado com sucesso.' });
}
