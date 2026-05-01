import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createBrowserSupabaseClient(): SupabaseClient {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in the frontend environment. Add them to .env and restart the dev server.'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

const nodeProcess = typeof process !== 'undefined' ? process : undefined;

export function createServerSupabaseClient(): SupabaseClient {
  if (!nodeProcess || !nodeProcess.versions) {
    throw new Error('createServerSupabaseClient() is only supported in Node.js server runtime.');
  }

  const serviceUrl = nodeProcess.env.SUPABASE_URL ?? '';
  const serviceKey = nodeProcess.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient(serviceUrl, serviceKey);
}
