import { createBrowserSupabaseClient } from 'saldo-verde-supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export const createClient = (): SupabaseClient => createBrowserSupabaseClient();

const requiredProfileFields = [
  'first_name',
  'last_name',
  'cpf',
  'phone',
  'birthdate',
  'cep',
  'street',
  'number',
  'complement',
  'neighborhood',
  'city',
  'state',
];

export const isProfileComplete = (session: Session | null) => {
  if (!session || !session.user.email) return false;

  const metadata = session.user.user_metadata as Record<string, unknown> | undefined;
  if (!metadata) return false;

  return requiredProfileFields.every((key) => {
    const value = metadata[key];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export const isGoogleSession = (session: Session | null) => {
  if (!session) return false;
  return Array.isArray(session.user.identities)
    ? session.user.identities.some((identity) => identity.provider === 'google')
    : false;
};
