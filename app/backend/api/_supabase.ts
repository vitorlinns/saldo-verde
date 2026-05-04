import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (globalThis as any)?.process?.env ?? {};

const supabaseUrl =
  env.SUPABASE_URL ??
  env.NEXT_PUBLIC_SUPABASE_URL ??
  env.VITE_SUPABASE_URL ??
  '';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_KEY ?? '';

export function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    console.error('[_supabase] Missing env vars — SUPABASE_URL:', !!supabaseUrl, 'SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
    throw new Error('Missing Supabase env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey);
}
