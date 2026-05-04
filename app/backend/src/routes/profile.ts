import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSessionUser } from '../lib/auth';
import { isValidCpf, isValidPhone, isValidCep, parseBirthdate, getAge, normalizeDigits } from '../lib/validation';

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

const getMetadataString = (metadata: Record<string, unknown> | undefined, key: string) => {
  const value = metadata?.[key];
  return typeof value === 'string' ? value : null;
};

const getNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return null;
};

const isMetadataComplete = (metadata: Record<string, unknown> | null | undefined) => {
  if (!metadata) return false;
  return requiredProfileFields.every((field) => {
    const value = metadata[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export function registerProfileRoutes(app: Express, supabase: SupabaseClient | null) {
  const handleGetProfile = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço indisponível no momento.' });
    }

    const sessionUser = await getSessionUser(supabase, req);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const userId = req.params.id;
    if (sessionUser.id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar este perfil.' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: 'Não foi possível carregar o perfil.' });
    }

    const metadata = sessionUser.user_metadata as Record<string, unknown> | undefined;
    const persisted = data as Record<string, unknown> | null;

    const profile = {
      id: userId,
      first_name: getNonEmpty(
        typeof persisted?.first_name === 'string' ? persisted.first_name : null,
        getMetadataString(metadata, 'first_name')
      ),
      last_name: getNonEmpty(
        typeof persisted?.last_name === 'string' ? persisted.last_name : null,
        getMetadataString(metadata, 'last_name')
      ),
      cpf: getNonEmpty(
        typeof persisted?.cpf === 'string' ? persisted.cpf : null,
        getMetadataString(metadata, 'cpf')
      ),
      phone: getNonEmpty(
        typeof persisted?.phone === 'string' ? persisted.phone : null,
        getMetadataString(metadata, 'phone')
      ),
      birthdate: getNonEmpty(
        typeof persisted?.birthdate === 'string' ? persisted.birthdate : null,
        getMetadataString(metadata, 'birthdate')
      ),
      cep: getNonEmpty(
        typeof persisted?.cep === 'string' ? persisted.cep : null,
        getMetadataString(metadata, 'cep')
      ),
      street: getNonEmpty(
        typeof persisted?.street === 'string' ? persisted.street : null,
        getMetadataString(metadata, 'street')
      ),
      number: getNonEmpty(
        typeof persisted?.number === 'string' ? persisted.number : null,
        getMetadataString(metadata, 'number')
      ),
      complement: getNonEmpty(
        typeof persisted?.complement === 'string' ? persisted.complement : null,
        getMetadataString(metadata, 'complement')
      ),
      neighborhood: getNonEmpty(
        typeof persisted?.neighborhood === 'string' ? persisted.neighborhood : null,
        getMetadataString(metadata, 'neighborhood')
      ),
      city: getNonEmpty(
        typeof persisted?.city === 'string' ? persisted.city : null,
        getMetadataString(metadata, 'city')
      ),
      state: getNonEmpty(
        typeof persisted?.state === 'string' ? persisted.state : null,
        getMetadataString(metadata, 'state')
      ),
      avatar_url: getNonEmpty(
        typeof persisted?.avatar_url === 'string' ? persisted.avatar_url : null,
        getMetadataString(metadata, 'avatar_url'),
        getMetadataString(metadata, 'picture')
      ),
    };

    return res.json({ profile });
  };

  app.get('/profile/:id', handleGetProfile);
  app.get('/api/profile/:id', handleGetProfile);

  const handleUpdateProfile = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço indisponível no momento.' });
    }

    const sessionUser = await getSessionUser(supabase, req);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const userId = req.params.id;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Identificador inválido.' });
    }

    if (sessionUser.id !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para atualizar este perfil.' });
    }

    const currentMetadata = sessionUser.user_metadata as Record<string, unknown> | undefined;
    const wasProfileComplete = isMetadataComplete(currentMetadata);

    const {
      first_name,
      last_name,
      cpf,
      phone,
      birthdate,
      cep,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      avatar_url,
    } = req.body;

    if (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0) {
      return res.status(400).json({ error: 'Primeiro nome é obrigatório.' });
    }

    if (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0) {
      return res.status(400).json({ error: 'Sobrenome é obrigatório.' });
    }

    if (!cpf || typeof cpf !== 'string' || !isValidCpf(cpf)) {
      return res.status(400).json({ error: 'CPF inválido. Deve ter 11 dígitos.' });
    }

    if (!phone || typeof phone !== 'string' || !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Telefone inválido.' });
    }

    if (!birthdate || typeof birthdate !== 'string') {
      return res.status(400).json({ error: 'Data de nascimento é obrigatória.' });
    }

    const parsedBirthdate = parseBirthdate(birthdate);
    if (!parsedBirthdate) {
      return res.status(400).json({ error: 'Data de nascimento inválida.' });
    }

    const age = getAge(parsedBirthdate);
    if (age < 18) {
      return res.status(400).json({ error: 'Você deve ter 18 anos ou mais para se cadastrar.' });
    }

    if (!cep || typeof cep !== 'string' || !isValidCep(cep)) {
      return res.status(400).json({ error: 'CEP inválido.' });
    }

    if (!street || typeof street !== 'string' || street.trim().length === 0) {
      return res.status(400).json({ error: 'Rua é obrigatória.' });
    }

    if (!number || typeof number !== 'string' || number.trim().length === 0) {
      return res.status(400).json({ error: 'Número é obrigatório.' });
    }

    if (!complement || typeof complement !== 'string' || complement.trim().length === 0) {
      return res.status(400).json({ error: 'Complemento é obrigatório.' });
    }

    if (!neighborhood || typeof neighborhood !== 'string' || neighborhood.trim().length === 0) {
      return res.status(400).json({ error: 'Bairro é obrigatório.' });
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return res.status(400).json({ error: 'Cidade é obrigatória.' });
    }

    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      return res.status(400).json({ error: 'Estado é obrigatório.' });
    }

    if (avatar_url && typeof avatar_url !== 'string') {
      return res.status(400).json({ error: 'Imagem inválida.' });
    }

    const metadata = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      cpf: normalizeDigits(cpf),
      phone: normalizeDigits(phone),
      birthdate: birthdate.trim(),
      cep: normalizeDigits(cep),
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      ...(avatar_url ? { avatar_url: avatar_url.trim() } : {}),
    };

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    });

    if (error) {
      return res.status(400).json({ error: 'Não foi possível atualizar o perfil. Revise os dados e tente novamente.' });
    }

    const { error: profileSyncError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...metadata,
      }, { onConflict: 'id' });

    if (profileSyncError) {
      console.error('Failed to sync profile table:', profileSyncError);
      return res.status(500).json({ error: 'Perfil atualizado, mas falhou ao sincronizar dados do perfil.' });
    }

    if (!wasProfileComplete) {
      await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          kind: 'profile-complete',
          title: 'Cadastro concluído',
          message: 'Tudo certo! Seu perfil está completo e você já pode usar a plataforma normalmente.',
          unread: true,
        });

      await supabase
        .from('user_notifications')
        .update({ unread: false })
        .eq('user_id', userId)
        .eq('kind', 'complete-profile');
    }

    return res.status(200).json({ user: data.user, message: 'Perfil atualizado com sucesso.' });
  };

  app.put('/profile/:id', handleUpdateProfile);
  app.put('/api/profile/:id', handleUpdateProfile);
}
