import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseClient(url?: string, key?: string): SupabaseClient | null {
  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}
