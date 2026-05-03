import { createSupabaseClient } from '../_supabase';
import { getSessionUser } from '../_auth';
import { handleOptions, sendJson } from '../_http';

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

const isMetadataComplete = (metadata: Record<string, unknown> | null | undefined) => {
  if (!metadata) return false;
  return requiredProfileFields.every((field) => {
    const value = metadata[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'PUT') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const userId = req.query.id;
  if (typeof userId !== 'string' || !userId) {
    return sendJson(res, 400, { error: 'Invalid user id' });
  }

  const supabase = createSupabaseClient();
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return sendJson(res, 400, { error: error.message });
    }

    return sendJson(res, 200, { profile: data });
  }

  const sessionUser = await getSessionUser(req);
  if (!sessionUser) {
    return sendJson(res, 401, { error: 'Invalid session' });
  }

  if (sessionUser.id !== userId) {
    return sendJson(res, 403, { error: 'Not allowed to update this profile' });
  }

  const currentMetadata = sessionUser.user_metadata as Record<string, unknown> | undefined;
  const wasProfileComplete = isMetadataComplete(currentMetadata);

  const payload = req.body ?? {};
  const normalizedPayload = {
    first_name: String(payload.first_name ?? '').trim(),
    last_name: String(payload.last_name ?? '').trim(),
    cpf: String(payload.cpf ?? '').replace(/\D/g, '').trim(),
    phone: String(payload.phone ?? '').replace(/\D/g, '').trim(),
    birthdate: String(payload.birthdate ?? '').trim(),
    cep: String(payload.cep ?? '').replace(/\D/g, '').trim(),
    street: String(payload.street ?? '').trim(),
    number: String(payload.number ?? '').trim(),
    complement: String(payload.complement ?? '').trim(),
    neighborhood: String(payload.neighborhood ?? '').trim(),
    city: String(payload.city ?? '').trim(),
    state: String(payload.state ?? '').trim(),
    ...(payload.avatar_url ? { avatar_url: String(payload.avatar_url).trim() } : {}),
  };

  const missingRequired = requiredProfileFields.some((field) => {
    const value = normalizedPayload[field as keyof typeof normalizedPayload];
    return typeof value !== 'string' || value.length === 0;
  });

  if (missingRequired) {
    return sendJson(res, 400, { error: 'Campos obrigatorios ausentes no perfil.' });
  }

  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: normalizedPayload,
  });

  if (error) {
    return sendJson(res, 400, { error: error.message });
  }

  if (!wasProfileComplete) {
    await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        kind: 'profile-complete',
        title: 'Cadastro concluido',
        message: 'Tudo certo! Seu perfil esta completo e voce ja pode usar a plataforma normalmente.',
        unread: true,
      });

    await supabase
      .from('user_notifications')
      .update({ unread: false })
      .eq('user_id', userId)
      .eq('kind', 'complete-profile');
  }

  return sendJson(res, 200, { user: data.user, message: 'Perfil atualizado com sucesso.' });
}
