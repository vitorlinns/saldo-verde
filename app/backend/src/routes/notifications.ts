import type { Express } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getUserNotifications } from '../lib/notification-messages';
import { getSessionUser } from '../lib/auth';

export function registerNotificationsRoutes(app: Express, supabase: SupabaseClient | null) {
  app.get('/notifications', async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    const user = await getSessionUser(supabase, req);
    if (!user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const notifications = getUserNotifications(user);
    return res.json({ notifications });
  });
}
