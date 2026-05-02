import type { Express } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  normalizeDigits,
  isValidCpf,
  isValidPhone,
  isValidCep,
  parseBirthdate,
  getAge,
} from '../lib/validation';

export function registerAuthRoutes(app: Express, supabase: SupabaseClient | null) {
  app.post('/register', async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    const { email, password, cpf, birthdate } = req.body;
    const normalizedCpf = normalizeDigits(cpf ?? '');

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'A senha deve ter ao menos 8 caracteres.' });
    }

    if (!cpf || typeof cpf !== 'string' || !isValidCpf(cpf)) {
      return res.status(400).json({ error: 'CPF inválido. Deve ter 11 dígitos numéricos.' });
    }

    if (!birthdate || typeof birthdate !== 'string') {
      return res.status(400).json({ error: 'Data de nascimento é obrigatória.' });
    }

    const birthDate = parseBirthdate(birthdate);
    if (!birthDate) {
      return res.status(400).json({ error: 'Data de nascimento inválida. Use o formato DD/MM/AAAA.' });
    }

    const age = getAge(birthDate);
    if (age < 18) {
      return res.status(400).json({ error: 'Você deve ter 18 anos ou mais para se cadastrar.' });
    }

    const { data: reservedAccount, error: reservedError } = await supabase
      .from('deleted_accounts')
      .select('id')
      .or(`email.eq.${email},cpf.eq.${normalizedCpf}`)
      .single();

    if (reservedError && reservedError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Erro ao verificar contas excluídas.' });
    }

    if (reservedAccount) {
      return res.status(409).json({ error: 'Não é possível criar nova conta com este email ou CPF.' });
    }

    const { data: existingEmailUser, error: emailError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();

    if (emailError && emailError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Erro ao verificar email cadastrado.' });
    }

    if (existingEmailUser) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    const { data: existingCpfUser, error: cpfError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('user_metadata->>cpf', normalizedCpf)
      .single();

    if (cpfError && cpfError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Erro ao verificar CPF cadastrado.' });
    }

    if (existingCpfUser) {
      return res.status(409).json({ error: 'CPF já cadastrado.' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        cpf: normalizedCpf,
        birthdate,
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ user: data.user, message: 'Conta criada com sucesso.' });
  });

  app.post('/login', async (req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    if (!data.session || !data.user) {
      return res.status(401).json({ error: 'Não foi possível autenticar o usuário.' });
    }

    return res.status(200).json({ session: data.session, user: data.user, message: 'Login realizado com sucesso.' });
  });

  app.post('/logout', async (_req, res) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    return res.status(200).json({ message: 'Logout realizado com sucesso.' });
  });

}
