import { createSupabaseClient } from './_supabase';

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

export async function getSessionUser(req: any) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  const supabase = createSupabaseClient();
  const { data, error } = await authGetUser(supabase.auth, token);
  if (error || !data?.user) {
    return null;
  }

  return data.user;
}
