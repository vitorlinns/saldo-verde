import type { Express, Request, Response } from 'express';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  consumeRateLimit,
} from '../lib/rate-limiter';
import {
  getSessionUser,
} from '../lib/auth';
import {
  normalizeDigits,
  isValidCpf,
  isValidPhone,
  isValidCep,
  parseBirthdate,
  getAge,
} from '../lib/validation';

const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 10;
const REFRESH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const REFRESH_RATE_LIMIT_MAX = 20;

function parseCookies(cookieHeader: string | undefined) {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) {
    return cookies;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) {
      continue;
    }

    cookies[rawKey] = decodeURIComponent(rawValue.join('='));
  }

  return cookies;
}

function getAccessTokenFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies.sv_at ?? null;
}

function getRefreshTokenFromRequest(req: Request) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies.sv_rt ?? null;
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return String(forwardedFor[0]).split(',')[0].trim();
  }

  return req.socket?.remoteAddress ?? 'unknown';
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('sv_at', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  res.cookie('sv_rt', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

function clearAuthCookies(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('sv_at', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });

  res.cookie('sv_rt', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'strict',
    maxAge: 0,
    path: '/api/auth',
  });
}

export function registerAuthRoutes(app: Express, supabase: SupabaseClient | null) {
  const registerPost = (paths: string[], handler: (req: Request, res: Response) => unknown) => {
    for (const path of paths) {
      app.post(path, handler);
    }
  };

  const registerGet = (paths: string[], handler: (req: Request, res: Response) => unknown) => {
    for (const path of paths) {
      app.get(path, handler);
    }
  };

  const handleRegister = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
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
      .maybeSingle();

    if (reservedError) {
      console.error('[register] deleted_accounts check error:', reservedError);
      return res.status(500).json({ error: 'Erro ao verificar contas excluídas.' });
    }

    if (reservedAccount) {
      return res.status(409).json({ error: 'Não é possível criar nova conta com este email ou CPF.' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
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
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already been registered')) {
        return res.status(409).json({ error: 'Email já cadastrado.' });
      }
      return res.status(400).json({ error: 'Não foi possível concluir o cadastro. Revise os dados e tente novamente.' });
    }

    // Auto-login after registration
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError || !loginData.session) {
      // Account created but auto-login failed, redirect to login page
      return res.status(201).json({ user: data.user, message: 'Conta criada com sucesso. Faça login para continuar.' });
    }

    return res.status(201).json({
      user: loginData.user,
      session: loginData.session,
      message: 'Conta criada com sucesso.',
    });
  };

  registerPost(['/register', '/api/register'], handleRegister);

  const handleLogin = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const rateLimitKey = `${req.ip || 'unknown'}:${normalizedEmail}`;
    const rateLimitResult = consumeRateLimit('express-auth-login', rateLimitKey, {
      windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
      max: LOGIN_RATE_LIMIT_MAX,
    });

    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds));
      return res.status(429).json({ error: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    if (!data.session || !data.user) {
      return res.status(401).json({ error: 'Não foi possível autenticar o usuário.' });
    }

    setAuthCookies(res, data.session.access_token, data.session.refresh_token);

    return res.status(200).json({ session: data.session, user: data.user, message: 'Login realizado com sucesso.' });
  };

  registerPost(['/login', '/api/login', '/auth/login', '/api/auth/login'], handleLogin);

  const handleRefresh = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token ausente.' });
    }

    const rateLimitResult = consumeRateLimit('express-auth-refresh', req.ip || 'unknown', {
      windowMs: REFRESH_RATE_LIMIT_WINDOW_MS,
      max: REFRESH_RATE_LIMIT_MAX,
    });

    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', String(rateLimitResult.retryAfterSeconds));
      return res.status(429).json({ error: 'Muitas tentativas de renovação. Aguarde alguns minutos antes de tentar novamente.' });
    }

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user) {
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }

    setAuthCookies(res, data.session.access_token, data.session.refresh_token);
    return res.status(200).json({ session: data.session, user: data.user, message: 'Sessão renovada com sucesso.' });
  };

  registerPost(['/auth/refresh', '/api/auth/refresh'], handleRefresh);

  const handleSessionCount = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    const sessionUser = await getSessionUser(supabase, req);
    if (!sessionUser) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    const clientIp = getClientIp(req);
    const { data, error } = await supabase
      .from('auth.sessions')
      .select('id', { count: 'planned' })
      .eq('user_id', sessionUser.id)
      .eq('ip_address', clientIp)
      .gt('not_after', new Date().toISOString());

    if (error) {
      console.error('[auth/sessions] count error:', error);
      return res.status(500).json({ error: 'Não foi possível contar as sessões ativas.' });
    }

    const count = Array.isArray(data) ? data.length : 0;
    return res.status(200).json({ count });
  };

  registerGet(['/auth/sessions', '/api/auth/sessions'], handleSessionCount);

  const handleMe = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    const accessToken = getAccessTokenFromRequest(req);
    if (!accessToken) {
      return res.status(401).json({ error: 'Sessão ausente.' });
    }

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Sessão inválida.' });
    }

    return res.status(200).json({ user: data.user, authenticated: true });
  };

  registerGet(['/auth/me', '/api/auth/me'], handleMe);

  const handleLogout = async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    const accessToken = getAccessTokenFromRequest(req);
    if (accessToken) {
      try {
        const { data: userData } = await supabase.auth.getUser(accessToken);
        if (userData?.user?.id) {
          await supabase.auth.admin.signOut(userData.user.id);
        }
      } catch (error) {
        console.warn('[auth/logout] admin signOut failed:', error);
      }
    }

    clearAuthCookies(res);
    return res.status(200).json({ message: 'Logout realizado com sucesso.' });
  };

  registerPost(['/auth/logout', '/api/auth/logout'], handleLogout);

  const handleLegacyLogout = async (_req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Serviço de autenticação indisponível no momento.' });
    }

    return res.status(200).json({ message: 'Logout realizado com sucesso.' });
  };

  registerPost(['/logout', '/api/logout'], handleLegacyLogout);

}
