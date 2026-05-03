import { createSupabaseClient } from '../_supabase';
import { getSessionUser } from '../_auth';
import { handleOptions, sendJson } from '../_http';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'PATCH') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const notificationId = req.query.id;
  if (typeof notificationId !== 'string' || !notificationId) {
    return sendJson(res, 400, { error: 'Invalid notification id' });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Invalid session' });
  }

  const supabase = createSupabaseClient();

  const { data: notification, error: fetchError } = await supabase
    .from('user_notifications')
    .select('id, user_id')
    .eq('id', notificationId)
    .single();

  if (fetchError || !notification) {
    return sendJson(res, 404, { error: 'Notification not found' });
  }

  if (notification.user_id !== user.id) {
    return sendJson(res, 403, { error: 'Not allowed to update this notification' });
  }

  const { error: updateError } = await supabase
    .from('user_notifications')
    .update({ unread: false })
    .eq('id', notificationId);

  if (updateError) {
    return sendJson(res, 500, { error: 'Failed to mark notification as read' });
  }

  return sendJson(res, 200, { message: 'Notification marked as read' });
}
