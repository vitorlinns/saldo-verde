import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

const BACKEND_API_BASE_URL = '/api';
const RETRYABLE_NETWORK_MESSAGES = ['failed to fetch', 'networkerror', 'err_connection_closed'];
const MAX_DAYS_WITHOUT_LOGIN = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LOGOUT_REQUEST_TIMEOUT_MS = 5000;

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

  let token: string | null = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token ?? null;
  } catch {
    // proceed without token
  }

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), LOGOUT_REQUEST_TIMEOUT_MS);
    try {
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  } catch (err) {
    console.warn('Backend logout failed:', err);
  }

  // Always clear local session, even if network logout/revocation fails.
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (err) {
    console.warn('Local logout failed:', err);
  }
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

export const shouldForceReLogin = (session: Session | null, maxDaysWithoutLogin = MAX_DAYS_WITHOUT_LOGIN) => {
  if (!session) {
    return false;
  }

  const lastSignInAt = session.user.last_sign_in_at;
  if (!lastSignInAt) {
    return false;
  }

  const lastSignInMs = new Date(lastSignInAt).getTime();
  if (!Number.isFinite(lastSignInMs)) {
    return false;
  }

  return Date.now() - lastSignInMs >= maxDaysWithoutLogin * DAY_IN_MS;
};
