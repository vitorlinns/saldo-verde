import { createSupabaseClient } from './_supabase';
import { handleOptions, sendJson } from './_http';

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const { email, password } = req.body ?? {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return sendJson(res, 400, { error: 'Email e senha sao obrigatorios.' });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[login] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de login indisponível no momento.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return sendJson(res, 401, { error: 'Email ou senha invalidos.' });
  }

  if (!data.session || !data.user) {
    return sendJson(res, 401, { error: 'Nao foi possivel autenticar o usuario.' });
  }

  return sendJson(res, 200, {
    session: data.session,
    user: data.user,
    message: 'Login realizado com sucesso.',
  });
}
