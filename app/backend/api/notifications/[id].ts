import { createSupabaseClient } from '../_supabase';
import { getSessionUser } from '../_auth';
import { handleOptions, sendJson } from '../_http';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'PATCH') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const notificationId = req.query.id;
  if (typeof notificationId !== 'string' || !notificationId) {
    return sendJson(res, 400, { error: 'Identificador de notificação inválido.' });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Sessão inválida.' });
  }

  const supabase = createSupabaseClient();

  const { data: notification, error: fetchError } = await supabase
    .from('user_notifications')
    .select('id')
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !notification) {
    return sendJson(res, 404, { error: 'Notificação não encontrada.' });
  }

  const { error: updateError } = await supabase
    .from('user_notifications')
    .update({ unread: false })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (updateError) {
    return sendJson(res, 500, { error: 'Não foi possível marcar a notificação como lida.' });
  }

  return sendJson(res, 200, { message: 'Notificação marcada como lida.' });
}
