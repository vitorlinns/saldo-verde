export function getClientIp(req: any) {
  const forwardedFor = req.headers?.['x-forwarded-for'];
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return String(forwardedFor[0]).split(',')[0].trim();
  }

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress ?? 'unknown';
}

export function parseCookies(cookieHeader: string | undefined) {
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

export function getCookie(req: any, key: string): string | null {
  const cookies = parseCookies(req.headers?.cookie);
  const value = cookies[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function getAccessTokenFromRequest(req: any) {
  const authHeader = req.headers?.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return getCookie(req, 'sv_at');
}

function isProductionEnv() {
  const nodeEnv = (globalThis as any)?.process?.env?.NODE_ENV as string | undefined;
  return nodeEnv === 'production';
}

export function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  const isProd = isProductionEnv();

  const accessCookie = [
    `sv_at=${encodeURIComponent(accessToken)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${15 * 60}`,
    ...(isProd ? ['Secure'] : []),
  ].join('; ');

  const refreshCookie = [
    `sv_rt=${encodeURIComponent(refreshToken)}`,
    'Path=/api/auth',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${30 * 24 * 60 * 60}`,
    ...(isProd ? ['Secure'] : []),
  ].join('; ');

  res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
}

export function clearAuthCookies(res: any) {
  const isProd = isProductionEnv();

  const expiredAccessCookie = [
    'sv_at=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    ...(isProd ? ['Secure'] : []),
  ].join('; ');

  const expiredRefreshCookie = [
    'sv_rt=',
    'Path=/api/auth',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
    ...(isProd ? ['Secure'] : []),
  ].join('; ');

  res.setHeader('Set-Cookie', [expiredAccessCookie, expiredRefreshCookie]);
}
