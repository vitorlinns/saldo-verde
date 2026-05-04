import { createSupabaseClient } from '../_supabase';
import { getSessionUser } from '../_auth';
import { handleOptions, sendJson } from '../_http';

const env = (globalThis as any)?.process?.env ?? {};

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'DELETE') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const allowedOrigins = new Set(
    [
      env.FRONTEND_ORIGIN,
      ...(String(env.FRONTEND_ORIGINS ?? '')
        .split(',')
        .map((o: string) => o.trim())),
    ].filter((v): v is string => Boolean(v)),
  );
  const origin = req.headers?.origin;
  if (origin && allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
    return sendJson(res, 403, { error: 'Forbidden origin' });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Sessão inválida.' });
  }

  const id = req.query?.id;
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) {
    return sendJson(res, 400, { error: 'ID inválido.' });
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from('financial_records')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return sendJson(res, 500, { error: 'Erro ao excluir o registro.' });
  }

  return sendJson(res, 200, { ok: true });
}
