import { createSupabaseClient } from './_supabase';
import { getAccessTokenFromRequest, getCookie, setAuthCookies } from './auth/_cookies';

export function getBearerToken(req: any): string | null {
  const authHeader = req.headers?.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice(7);
}

export async function authGetUser(auth: any, accessToken: string) {
  if (auth?.getUser) {
    const result = await auth.getUser(accessToken);
    if (result && typeof result === 'object' && 'data' in result) {
      return result;
    }

    return {
      data: { user: (result as any)?.user ?? null },
      error: (result as any)?.error ?? null,
    };
  }

  if (auth?.api?.getUser) {
    const legacy = await auth.api.getUser(accessToken);
    return {
      data: { user: legacy?.user ?? null },
      error: legacy?.error ?? null,
    };
  }

  return {
    data: { user: null },
    error: new Error('Método de consulta de usuário não disponível no cliente Supabase.'),
  };
}

export async function authAdminSignOut(auth: any, userId: string) {
  if (auth?.admin?.signOut) {
    return auth.admin.signOut(userId);
  }

  return { error: null };
}

export async function authSignInWithPassword(auth: any, email: string, password: string) {
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

export async function authRefreshSession(auth: any, refreshToken: string) {
  if (auth?.refreshSession) {
    return auth.refreshSession({ refresh_token: refreshToken });
  }

  if (auth?.api?.refreshAccessToken) {
    const legacy = await auth.api.refreshAccessToken(refreshToken);
    return {
      data: {
        user: legacy?.user ?? null,
        session: legacy?.data?.session ?? null,
      },
      error: legacy?.error ?? null,
    };
  }

  return {
    data: { user: null, session: null },
    error: new Error('Método de renovação de sessão não disponível no cliente Supabase.'),
  };
}

export async function getSessionUser(req: any, res?: any) {
  const supabase = createSupabaseClient();

  const bearerToken = getBearerToken(req);
  const accessToken = bearerToken ?? getAccessTokenFromRequest(req);

  if (accessToken) {
    const { data, error } = await authGetUser(supabase.auth, accessToken);
    if (!error && data?.user) {
      return data.user;
    }
  }

  const refreshToken = getCookie(req, 'sv_rt');
  if (!refreshToken) {
    return null;
  }

  const { data: refreshData, error: refreshError } = await authRefreshSession(supabase.auth, refreshToken);
  if (refreshError || !refreshData?.session || !refreshData?.user) {
    return null;
  }

  if (res) {
    setAuthCookies(res, refreshData.session.access_token, refreshData.session.refresh_token);
  }

  return refreshData.user;
}
