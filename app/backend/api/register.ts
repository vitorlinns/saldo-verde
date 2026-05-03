import { createSupabaseClient } from './_supabase';
import { handleOptions, sendJson } from './_http';

const normalizeDigits = (value: string) => value.replace(/\D/g, '');

const isValidCpf = (value: string) => normalizeDigits(value).length === 11;

const parseBirthdate = (value: string): Date | null => {
  const digits = normalizeDigits(value);
  if (digits.length !== 8) return null;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) return null;
  return date;
};

const getAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

async function createUserWithAdmin(auth: any, payload: any) {
  if (auth?.admin?.createUser) {
    return auth.admin.createUser(payload);
  }

  if (auth?.api?.createUser) {
    return auth.api.createUser(payload);
  }

  return { data: null, error: new Error('Método de criação de usuário não disponível no cliente Supabase.') };
}

async function signInWithPasswordCompat(auth: any, email: string, password: string) {
  if (auth?.signInWithPassword) {
    return auth.signInWithPassword({ email, password });
  }

  if (auth?.signIn) {
    const legacy = await auth.signIn({ email, password });
    return {
      data: {
        user: legacy?.user ?? null,
        session: legacy?.session ?? null,
      },
      error: legacy?.error ?? null,
    };
  }

  return {
    data: { user: null, session: null },
    error: new Error('Método de login por senha não disponível no cliente Supabase.'),
  };
}

export default async function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }

  const { email, password, cpf, birthdate } = req.body ?? {};
  const normalizedCpf = normalizeDigits(cpf ?? '');

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendJson(res, 400, { error: 'Email inválido.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return sendJson(res, 400, { error: 'A senha deve ter ao menos 8 caracteres.' });
  }

  if (!cpf || typeof cpf !== 'string' || !isValidCpf(cpf)) {
    return sendJson(res, 400, { error: 'CPF inválido. Deve ter 11 dígitos numéricos.' });
  }

  if (!birthdate || typeof birthdate !== 'string') {
    return sendJson(res, 400, { error: 'Data de nascimento é obrigatória.' });
  }

  const birthDate = parseBirthdate(birthdate);
  if (!birthDate) {
    return sendJson(res, 400, { error: 'Data de nascimento inválida. Use o formato DD/MM/AAAA.' });
  }

  if (getAge(birthDate) < 18) {
    return sendJson(res, 400, { error: 'Você deve ter 18 anos ou mais para se cadastrar.' });
  }

  let supabase;
  try {
    supabase = createSupabaseClient();
  } catch (error) {
    console.error('[register] supabase init error:', error);
    return sendJson(res, 503, { error: 'Serviço de cadastro indisponível no momento.' });
  }

  // Check deleted accounts
  const { data: reservedAccount, error: reservedError } = await supabase
    .from('deleted_accounts')
    .select('id')
    .or(`email.eq.${email},cpf.eq.${normalizedCpf}`)
    .maybeSingle();

  if (reservedError) {
    console.error('[register] deleted_accounts check error:', reservedError);
    return sendJson(res, 500, { error: 'Erro ao verificar contas excluídas.' });
  }

  if (reservedAccount) {
    return sendJson(res, 409, { error: 'Não é possível criar nova conta com este email ou CPF.' });
  }

  // Create user
  const auth = supabase.auth as any;

  const { data, error } = await createUserWithAdmin(auth, {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      cpf: normalizedCpf,
      birthdate,
    },
  });

  if (error) {
    console.error('[register] createUser error:', error);
    if (
      error.message.toLowerCase().includes('already registered') ||
      error.message.toLowerCase().includes('already been registered')
    ) {
      return sendJson(res, 409, { error: 'Email já cadastrado.' });
    }
    return sendJson(res, 400, { error: 'Não foi possível concluir o cadastro. Revise os dados e tente novamente.' });
  }

  // Auto-login after registration
  const { data: loginData, error: loginError } = await signInWithPasswordCompat(auth, email, password);

  if (loginError || !loginData.session) {
    return sendJson(res, 201, {
      user: data.user,
      message: 'Conta criada com sucesso. Faça login para continuar.',
    });
  }

  return sendJson(res, 201, {
    user: loginData.user,
    session: loginData.session,
    message: 'Conta criada com sucesso.',
  });
}
