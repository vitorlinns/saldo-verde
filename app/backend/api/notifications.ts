import { createSupabaseClient } from './_supabase';
import { getSessionUser } from './_auth';
import { handleOptions, sendJson } from './_http';

const formatDate = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
};

const formatTime = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const user = await getSessionUser(req);
  if (!user) {
    return sendJson(res, 401, { error: 'Invalid session' });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('user_notifications')
    .select('id, title, message, unread, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return sendJson(res, 500, { error: 'Failed to fetch notifications' });
  }

  const notifications = (data ?? []).map((item) => {
    const createdAt = new Date(item.created_at as string);
    return {
      id: item.id,
      title: item.title,
      message: item.message,
      unread: item.unread,
      date: formatDate(createdAt),
      time: formatTime(createdAt),
    };
  });

  return sendJson(res, 200, { notifications });
}
