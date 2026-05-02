import { createClient, SupabaseClient } from '@supabase/supabase-js';

type BrowserEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

type BrowserSupabaseOptions = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

type NodeProcessLike = {
  versions?: unknown;
  env: Record<string, string | undefined>;
};

function getBrowserEnv(): BrowserEnv {
  const meta = import.meta as ImportMeta & { env?: BrowserEnv };
  return meta.env ?? {};
}

function getNodeProcess(): NodeProcessLike | undefined {
  if (typeof globalThis !== 'object' || globalThis === null) {
    return undefined;
  }

  const maybeProcess = (globalThis as { process?: NodeProcessLike }).process;
  return maybeProcess;
}

export function createBrowserSupabaseClient(options: BrowserSupabaseOptions = {}): SupabaseClient {
  const browserEnv = getBrowserEnv();
  const supabaseUrl = options.supabaseUrl ?? browserEnv.VITE_SUPABASE_URL ?? '';
  const supabaseAnonKey = options.supabaseAnonKey ?? browserEnv.VITE_SUPABASE_ANON_KEY ?? '';

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

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

const nodeProcess = getNodeProcess();

export function createServerSupabaseClient(): SupabaseClient {
  if (!nodeProcess || !nodeProcess.versions) {
    throw new Error('createServerSupabaseClient() is only supported in Node.js server runtime.');
  }

  const serviceUrl = nodeProcess.env.SUPABASE_URL ?? '';
  const serviceKey = nodeProcess.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient(serviceUrl, serviceKey);
}
