import type { Express } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSessionUser, reserveDeletedAccountData } from '../lib/auth';
import { normalizeDigits } from '../lib/validation';

export function registerAccountRoutes(app: Express, supabase: SupabaseClient | null) {
  app.delete('/account/:id', async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de conta indisponível no momento.' });
    }

    const user = await getSessionUser(supabase, req);
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const userId = req.params.id;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Identificador de usuário inválido.' });
    }

    if (user.id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta conta.' });
    }

    const userEmail = user.email ?? null;
    const userCpf = typeof user.user_metadata?.cpf === 'string'
      ? normalizeDigits(user.user_metadata.cpf)
      : null;

    if (userEmail || userCpf) {
      const reserveResult = await reserveDeletedAccountData(supabase, userEmail, userCpf);
      if (reserveResult?.error) {
        console.error('Failed to reserve deleted account data:', reserveResult.error);
        return res.status(500).json({ error: 'Falha ao registrar conta excluída.' });
      }
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      return res.status(400).json({ error: 'Não foi possível excluir a conta no momento.' });
    }

    return res.status(200).json({ message: 'Conta excluída com sucesso.' });
  });
}
