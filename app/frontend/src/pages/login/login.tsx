import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete } from '../../lib/auth';
import type { Session } from '@supabase/supabase-js';
import ButtonGeneral from '../../components/btn/button_general';
import ButtonGoogle from '../../components/btn/button_google';
import AuthSidePanel from '../../components/login/auth-side-panel';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';
import InputGeneral from '../../components/inputs/input_general';

const BACKEND_URL = '/api';
const FOOTER_URL = `${BACKEND_URL}/footer-text`;
const LOGIN_URL = `${BACKEND_URL}/auth/login`;
const OAUTH_REDIRECT_TO = import.meta.env.VITE_OAUTH_REDIRECT_TO ?? `${window.location.origin}/login`;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 3;
const LOGIN_THROTTLE_STORAGE_KEY = 'saldo-verde:login-throttle';
const LOCKOUT_STEPS_MS = [60_000, 300_000, 900_000] as const;

interface LoginThrottleState {
  failedAttempts: number;
  lockoutCount: number;
  lockedUntil: number | null;
}

const initialLoginThrottleState: LoginThrottleState = {
  failedAttempts: 0,
  lockoutCount: 0,
  lockedUntil: null,
};

function readLoginThrottleState(): LoginThrottleState {
  if (typeof window === 'undefined') {
    return initialLoginThrottleState;
  }

  try {
    const raw = window.localStorage.getItem(LOGIN_THROTTLE_STORAGE_KEY);
    if (!raw) {
      return initialLoginThrottleState;
    }

    const parsed = JSON.parse(raw) as Partial<LoginThrottleState>;
    return {
      failedAttempts: typeof parsed.failedAttempts === 'number' ? parsed.failedAttempts : 0,
      lockoutCount: typeof parsed.lockoutCount === 'number' ? parsed.lockoutCount : 0,
      lockedUntil: typeof parsed.lockedUntil === 'number' ? parsed.lockedUntil : null,
    };
  } catch {
    return initialLoginThrottleState;
  }
}

function persistLoginThrottleState(state: LoginThrottleState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOGIN_THROTTLE_STORAGE_KEY, JSON.stringify(state));
}

function clearLoginThrottleState() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LOGIN_THROTTLE_STORAGE_KEY);
}

function getLockoutDurationMs(lockoutCount: number) {
  const index = Math.min(Math.max(lockoutCount - 1, 0), LOCKOUT_STEPS_MS.length - 1);
  return LOCKOUT_STEPS_MS[index];
}

function normalizeAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
    return 'Email ou senha inválidos.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de fazer login.';
  }
  if (lower.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde um momento e tente novamente.';
  }
  return 'Ocorreu um erro ao tentar fazer login. Tente novamente.';
}

export default function LoginPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [footerText, setFooterText] = useState('© 2026 Saldo Verde. Todos os direitos reservados.');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutCount, setLockoutCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const navigate = useNavigate();
  const isLocked = lockedUntil !== null && lockedUntil > currentTime;
  const remainingSeconds = isLocked ? Math.ceil((lockedUntil - currentTime) / 1000) : 0;

  useEffect(() => {
    const storedState = readLoginThrottleState();
    setFailedAttempts(storedState.failedAttempts);
    setLockoutCount(storedState.lockoutCount);
    setLockedUntil(storedState.lockedUntil);
  }, []);

  useEffect(() => {
    persistLoginThrottleState({
      failedAttempts,
      lockoutCount,
      lockedUntil,
    });
  }, [failedAttempts, lockoutCount, lockedUntil]);

  useEffect(() => {
    if (!lockedUntil) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      if (lockedUntil <= now) {
        setLockedUntil(null);
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lockedUntil]);

  useEffect(() => {
    setIsGoogleLoading(false);

    try {
      const client = createClient();

      const initializeSession = async () => {
        const hasAuthParams = window.location.hash.includes('access_token=') || window.location.search.includes('access_token=');

        const { data } = await client.auth.getSession();
        const currentSession = data.session ?? null;
        setIsGoogleLoading(false);

        if (hasAuthParams) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        setSession(currentSession);
        if (currentSession) {
          const destination = isProfileComplete(currentSession) ? '/dashboard' : '/perfil';
          navigate(destination, { replace: true });
        }
      };

      initializeSession();

      const { data: authListener } = client.auth.onAuthStateChange((_event, sessionData) => {
        const currentSession = sessionData ?? null;
        setSession(currentSession);
        if (currentSession) {
          const destination = isProfileComplete(currentSession) ? '/dashboard' : '/perfil';
          navigate(destination, { replace: true });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (err) {
      setIsGoogleLoading(false);
      setError('Não foi possível iniciar o login. Por favor, tente novamente.');
      console.error('LoginPage init error:', err);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchFooterText = async () => {
      try {
        const response = await fetch(FOOTER_URL);
        if (!response.ok) {
          throw new Error(`Footer request failed with status ${response.status}`);
        }
        const data = await response.json();
        setFooterText(data.copyright ?? footerText);
      } catch (err) {
        console.error('Failed to load footer text:', err);
      }
    };

    fetchFooterText();
  }, []);

  const handleSignIn = async () => {
    if (isLocked) {
      setError(`Aguarde ${remainingSeconds} segundo(s) para tentar novamente.`);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      setError('Informe email e senha para continuar.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError('Não foi possível iniciar o login. Por favor, tente novamente.');
      return;
    }

    setIsAuthenticating(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const result = await response.json().catch(() => ({} as Record<string, unknown>));

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = Number.parseInt(retryAfterHeader ?? '60', 10);
        const lockoutDurationMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
          ? retryAfterSeconds * 1000
          : 60_000;
        const nextLockoutCount = lockoutCount + 1;

        setFailedAttempts(0);
        setLockoutCount(nextLockoutCount);
        setCurrentTime(Date.now());
        setLockedUntil(Date.now() + lockoutDurationMs);
        setError(
          typeof result.error === 'string'
            ? result.error
            : `Muitas tentativas malsucedidas. Aguarde ${Math.ceil(lockoutDurationMs / 1000)} segundos antes de tentar novamente.`
        );
        return;
      }

      if (!response.ok) {
        const next = failedAttempts + 1;
        if (next >= MAX_ATTEMPTS) {
          const nextLockoutCount = lockoutCount + 1;
          const lockoutDurationMs = getLockoutDurationMs(nextLockoutCount);
          setFailedAttempts(0);
          setLockoutCount(nextLockoutCount);
          setCurrentTime(Date.now());
          setLockedUntil(Date.now() + lockoutDurationMs);
          setError(`Muitas tentativas malsucedidas. Aguarde ${Math.ceil(lockoutDurationMs / 1000)} segundos antes de tentar novamente.`);
        } else {
          setFailedAttempts(next);
          const backendError = typeof result.error === 'string' ? result.error : '';
          setError(normalizeAuthError(backendError));
        }
        return;
      }

      const sessionPayload = (result as { session?: Session }).session;
      if (!sessionPayload) {
        setError('Falha ao autenticar. Tente novamente.');
        return;
      }

      const { error: setSessionError } = await supabase.auth.setSession(sessionPayload);
      if (setSessionError) {
        setError('Falha ao autenticar. Tente novamente.');
        return;
      }

      setFailedAttempts(0);
      setLockoutCount(0);
      setLockedUntil(null);
      clearLoginThrottleState();
      setMessage('Login realizado com sucesso. Redirecionando...');
      const destination = isProfileComplete(sessionPayload) ? '/dashboard' : '/perfil';
      setTimeout(() => navigate(destination, { replace: true }), 1500);
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
      console.error('Login error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError('Não foi possível iniciar o login com Google. Por favor, tente novamente.');
      return;
    }

    setIsGoogleLoading(true);
    setError('');
    setMessage('');

    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: OAUTH_REDIRECT_TO,
        },
      });

      if (oauthError) {
        setError(oauthError.message || 'Ocorreu um erro ao tentar fazer login com Google.');
        setIsGoogleLoading(false);
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      setError('Não foi possível iniciar o fluxo de autenticação com Google.');
      setIsGoogleLoading(false);
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login com Google. Por favor, tente novamente.');
      console.error('Google login error:', err);
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <AuthSidePanel />

        <div className="relative overflow-hidden flex min-h-screen items-center justify-center bg-background px-6 py-12 lg:min-h-0 lg:items-end lg:pb-14 lg:pt-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(130,222,127,0.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.012),transparent_28%)]" />
          <div className="relative z-10 w-full max-w-md rounded-[1rem] border border-border bg-surface p-8 sm:p-10">
            <div className="mb-6 space-y-4">
              <div className="flex justify-left">
                <img src="/assets/brand/isologo.webp" alt="Logo" className="block h-auto w-28 object-contain sm:w-32" />
              </div>

              <h2 className="text-3xl font-regular tracking-tight text-white sm:text-3xl">
                Acesse sua conta
              </h2>
              <p className="mt-2 text-regurlar text-white/70">
                  Se você já possui uma conta, preencha com seus dados.
                </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-3">
                <InputGeneral
                  id="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Digite seu e-mail"
                  className="mt-0"
                  maxLength={45}
                  autoComplete="email"
                />

                <InputGeneral
                  id="password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Digite sua senha"
                  className="mt-0"
                  maxLength={20}
                  autoComplete="current-password"
                />

                <div className="text-right text-sm text-white">
                  <Link to="/recuperar-conta" className="font-regular text-white">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <ButtonGeneral
                  type="button"
                  onClick={handleSignIn}
                  label={isLocked ? `Aguarde ${remainingSeconds}s` : 'Acessar conta'}
                  loading={isAuthenticating}
                  className="mt-2"
                  disabled={isLocked}
                />

                <div className="text-center text-sm text-white">Ou</div>

                <ButtonGoogle type="button" onClick={handleGoogleSignIn} loading={isGoogleLoading} />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white">
                <span>Não possui conta?</span>
                <Link to="/criar-conta" className="font-regular text-primary-300 transition hover:text-primary-400">
                  Criar conta.
                </Link>
              </div>

              {message ? <SuccessMessage>{message}</SuccessMessage> : null}
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            </div>

          </div>
        </div>
      </section>

      <div className="w-full bg-black border-t border-border px-6 py-4">
        <div className="mx-auto w-full max-w-md text-center text-sm text-gray">
          {footerText}
        </div>
      </div>
    </main>
  );
}
