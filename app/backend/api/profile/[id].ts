import { createSupabaseClient } from '../_supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = req.query.id;
  if (typeof userId !== 'string' || !userId) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ profile: data });
}
