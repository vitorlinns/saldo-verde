import type { Express } from 'express';
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

const isMetadataComplete = (metadata: Record<string, unknown> | null | undefined) => {
  if (!metadata) return false;
  return requiredProfileFields.every((field) => {
    const value = metadata[field];
    return typeof value === 'string' && value.trim().length > 0;
  });
};

export function registerProfileRoutes(app: Express, supabase: SupabaseClient | null) {
  app.get('/profile/:id', async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    const sessionUser = await getSessionUser(supabase, req);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const userId = req.params.id;
    if (sessionUser.id !== userId) {
      return res.status(403).json({ error: 'Not allowed to access this profile' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ profile: data });
  });

  app.put('/profile/:id', async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    const sessionUser = await getSessionUser(supabase, req);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const userId = req.params.id;
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (sessionUser.id !== userId) {
      return res.status(403).json({ error: 'Not allowed to update this profile' });
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
      return res.status(400).json({ error: error.message });
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
  });
}
