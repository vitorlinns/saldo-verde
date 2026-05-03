import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete } from '../../lib/auth';
import type { Session } from '@supabase/supabase-js';
import ButtonGeneral from '../../components/btn/button_general';
import ButtonGoogle from '../../components/btn/button_google';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';
import InputGeneral from '../../components/inputs/input_general';

const BACKEND_URL = '/api';
const FOOTER_URL = `${BACKEND_URL}/footer-text`;
const OAUTH_REDIRECT_TO = import.meta.env.VITE_OAUTH_REDIRECT_TO ?? `${window.location.origin}/login`;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 30_000;

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
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const navigate = useNavigate();

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
    if (lockedUntil && Date.now() < lockedUntil) {
      const seconds = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Aguarde ${seconds} segundo(s) para tentar novamente.`);
      return;
    }

    if (!email || !password) {
      setError('Informe email e senha para continuar.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const next = failedAttempts + 1;
        setFailedAttempts(next);
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          setError(`Muitas tentativas malsucedidas. Aguarde ${LOCKOUT_MS / 1000} segundos antes de tentar novamente.`);
        } else {
          setError(normalizeAuthError(signInError.message));
        }
        return;
      }

      if (!data.session) {
        setError('Falha ao autenticar. Tente novamente.');
        return;
      }

      setFailedAttempts(0);
      setLockedUntil(null);
      setMessage('Login realizado com sucesso. Redirecionando...');
      const destination = isProfileComplete(data.session as Session) ? '/dashboard' : '/perfil';
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
        <div className="hidden lg:block bg-background" />

        <div className="flex items-center justify-center bg-background px-6 py-12">
          <div className="w-full max-w-md rounded-[1rem] border border-border bg-surface p-8 sm:p-10">
            <div className="mb-6 space-y-4">
              <div className="flex justify-left">
                <img src="/assets/brand/isologo.png" alt="Logo" className="h-12 w-auto" />
              </div>

              <h2 className="text-3xl font-regular tracking-tight text-white sm:text-3xl">
                Acesse sua conta
              </h2>
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
                  
                />

                <InputGeneral
                  id="password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Digite sua senha"
                  className="mt-0"
                  maxLength={20}
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
                  label="Acessar conta"
                  loading={isAuthenticating}
                  className="mt-2"
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
