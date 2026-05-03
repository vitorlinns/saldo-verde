import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

const BACKEND_API_BASE_URL = '/api';
const RETRYABLE_NETWORK_MESSAGES = ['failed to fetch', 'networkerror', 'err_connection_closed'];

let supabaseClient: SupabaseClient | null = null;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableNetworkError = (error: unknown) => {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return RETRYABLE_NETWORK_MESSAGES.some((token) => message.includes(token));
};

const retryableFetch: typeof fetch = async (input, init) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < 2 && isRetryableNetworkError(error);
      if (!shouldRetry) {
        throw error;
      }
      await delay(200 * (attempt + 1));
    }
  }

  throw lastError;
};

export const createClient = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in the frontend environment. Add them to .env and restart the dev server.'
    );
  }

  if (supabaseAnonKey.startsWith('sb_secret') || supabaseAnonKey.toLowerCase().includes('secret')) {
    throw new Error(
      'Forbidden use of secret API key in browser. Set VITE_SUPABASE_ANON_KEY to the public/anon key, not the service role secret.'
    );
  }

  supabaseClient = createSupabaseJsClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: retryableFetch,
    },
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return supabaseClient;
};

export const signOutWithBackend = async (
  supabase: SupabaseClient | null,
  backendUrl = BACKEND_API_BASE_URL
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
