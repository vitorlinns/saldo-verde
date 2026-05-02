import { createBrowserSupabaseClient } from 'saldo-verde-supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export const createClient = (): SupabaseClient => createBrowserSupabaseClient();

export const signOutWithBackend = async (
  supabase: SupabaseClient | null,
  backendUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4001'
) => {
  if (!supabase) return;

  try {
    await fetch(`${backendUrl}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.warn('Backend logout failed:', err);
  }

  await supabase.auth.signOut();
};

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
