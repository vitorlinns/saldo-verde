import type { Request } from 'express';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { normalizeDigits } from './validation';

export const getBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.replace('Bearer ', '');
};

export const getSessionUser = async (
  supabase: SupabaseClient | null,
  req: Request,
): Promise<User | null> => {
  if (!supabase) {
    return null;
  }

  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  const { data: userData, error } = await supabase.auth.getUser(token);
  if (error || !userData?.user) {
    return null;
  }

  return userData.user;
};

export const reserveDeletedAccountData = async (
  supabase: SupabaseClient,
  email: string | null,
  cpf: string | null,
) => {
  if (!email && !cpf) {
    return null;
  }

  return supabase.from('deleted_accounts').upsert(
    {
      email,
      cpf,
      deleted_at: new Date().toISOString(),
    },
    { onConflict: 'email,cpf' },
  );
};
