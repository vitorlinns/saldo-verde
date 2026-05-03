import type { Express } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSessionUser } from '../lib/auth';

const formatDate = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
};

const formatTime = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

export function registerNotificationsRoutes(app: Express, supabase: SupabaseClient | null) {
  app.get('/notifications', async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    const user = await getSessionUser(supabase, req);
    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const unreadOnly = req.query.unread === 'true';
    const limitRaw = req.query.limit;
    const parsedLimit = Number.parseInt(typeof limitRaw === 'string' ? limitRaw : '', 10);
    const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 50) : null;

    let query = supabase
      .from('user_notifications')
      .select('id, title, message, unread, created_at')
      .eq('user_id', user.id);

    if (unreadOnly) {
      query = query.eq('unread', true);
    }

    query = query.order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch notifications' });
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

    return res.json({ notifications });
  });
}
