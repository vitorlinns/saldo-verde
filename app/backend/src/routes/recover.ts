import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createRecoveryEntry, getRecoveryEntry, verifyRecoveryCode, consumeRecoveryEntry } from '../lib/recovery';
import { sendRecoveryEmail } from '../lib/email';

const isValidEmail = (value: unknown): value is string =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function registerRecoverRoutes(app: Express, supabase: SupabaseClient | null) {
  const handleRecoverRequest = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    const { email } = req.body;

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }

    const normalizedEmail = email.toLowerCase();

    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Erro ao verificar usuário.' });
    }

    const entry = createRecoveryEntry(normalizedEmail);

    if (userData) {
      try {
        await sendRecoveryEmail(normalizedEmail, entry.code);
      } catch (err) {
        console.error('Failed to send recovery email:', err);
        return res.status(500).json({ error: 'Não foi possível enviar o email de recuperação.' });
      }
    }

    return res.status(200).json({ message: 'Se o email existir, você receberá as instruções para recuperação.' });
  };

  app.post('/recover/request', handleRecoverRequest);
  app.post('/api/recover/request', handleRecoverRequest);

  const handleRecoverVerify = async (req: Request, res: Response) => {
    const { email, code } = req.body;

    if (!isValidEmail(email) || typeof code !== 'string') {
      return res.status(400).json({ error: 'Email ou código inválidos.' });
    }

    if (!verifyRecoveryCode(email.toLowerCase(), code.trim())) {
      return res.status(400).json({ error: 'Código inválido ou expirado.' });
    }

    return res.status(200).json({ message: 'Código de recuperação verificado.' });
  };

  app.post('/recover/verify', handleRecoverVerify);
  app.post('/api/recover/verify', handleRecoverVerify);

  const handleRecoverReset = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    const { email, code, password } = req.body;

    if (!isValidEmail(email) || typeof code !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Dados inválidos.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter ao menos 8 caracteres.' });
    }

    const entry = getRecoveryEntry(email.toLowerCase());
    if (!entry || entry.code !== code.trim() || entry.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Código inválido ou expirado.' });
    }

    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (userError) {
      return res.status(400).json({ error: 'Não foi possível encontrar o usuário.' });
    }

    if (!userData?.id) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userData.id, {
      password,
    });

    if (error) {
      console.error('Failed to reset password:', error);
      return res.status(500).json({ error: 'Não foi possível redefinir a senha.' });
    }

    consumeRecoveryEntry(email.toLowerCase());
    return res.status(200).json({ message: 'Senha redefinida com sucesso.' });
  };

  app.post('/recover/reset', handleRecoverReset);
  app.post('/api/recover/reset', handleRecoverReset);
}
