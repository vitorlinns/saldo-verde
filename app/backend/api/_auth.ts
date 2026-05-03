import { createSupabaseClient } from './_supabase';

export function getBearerToken(req: any): string | null {
  const authHeader = req.headers?.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
}

export async function getSessionUser(req: any) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return null;
  }

  return data.user;
}
