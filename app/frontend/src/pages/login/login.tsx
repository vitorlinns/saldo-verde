import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete } from '../../lib/auth';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import ButtonGeneral from '../../components/btn/button_general';
import ButtonGoogle from '../../components/btn/button_google';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';
import InputGeneral from '../../components/inputs/input_general';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? window.location.origin;
const OAUTH_REDIRECT_TO = import.meta.env.VITE_OAUTH_REDIRECT_TO ?? `${window.location.origin}/login`;

const TEST_USER_EMAIL = 'teste@saldoverde.pro';
const TEST_USER_PASSWORD = 'Teste123!';

export default function LoginPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [footerText, setFooterText] = useState('© 2026 Saldo Verde. Todos os direitos reservados.');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);

      const initializeSession = async () => {
        const hasAuthParams = window.location.hash.includes('access_token=') || window.location.search.includes('access_token=');
        let currentSession: Session | null = null;

        const { data } = await client.auth.getSession();
        currentSession = data.session ?? null;

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
      const message = err instanceof Error ? err.message : 'Não foi possível iniciar o login. Por favor, tente novamente.';
      setError(message);
      console.error('LoginPage init error:', err);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchFooterText = async () => {
      try {
        const response = await fetch('/api/footer-text');
        const data = await response.json();
        setFooterText(data.copyright ?? footerText);
      } catch (err) {
        console.error('Failed to load footer text:', err);
      }
    };

    fetchFooterText();
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Informe email e senha para continuar.');
      return;
    }

    if (!supabase) {
      setError('Não foi possível iniciar o login. Por favor, tente novamente.');
      return;
    }

    setIsAuthenticating(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Email ou senha inválidos.');
        return;
      }

      const { session: loginSession, user } = result;
      if (!loginSession) {
        setError('Falha ao autenticar. Tente novamente.');
        return;
      }

      const { error: setSessionError } = await supabase.auth.setSession(loginSession);
      if (setSessionError) {
        setError(setSessionError.message);
        return;
      }

      setMessage('Login realizado com sucesso. Redirecionando...');
      const destination = isProfileComplete({ user: { ...user, user_metadata: user.user_metadata } } as Session) ? '/dashboard' : '/perfil';
      setTimeout(() => navigate(destination, { replace: true }), 1500);
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
      console.error('Login error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleTestUserSignIn = async () => {
    if (!supabase) {
      setError('Não foi possível iniciar o login de teste. Por favor, tente novamente.');
      return;
    }

    setIsAuthenticating(true);
    setError('');
    setMessage('Usando usuário de teste...');

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Não foi possível entrar com o usuário de teste.');
        setMessage('');
        return;
      }

      const { session: loginSession } = result;
      if (!loginSession) {
        setError('Falha ao autenticar o usuário de teste.');
        setMessage('');
        return;
      }

      const { error: setSessionError } = await supabase.auth.setSession(loginSession);
      if (setSessionError) {
        setError(setSessionError.message);
        setMessage('');
        return;
      }

      setEmail(TEST_USER_EMAIL);
      setPassword(TEST_USER_PASSWORD);
      setMessage('Login de teste realizado. Redirecionando...');
    } catch (err) {
      setError('Ocorreu um erro ao entrar com o usuário de teste.');
      console.error('Test user login error:', err);
      setMessage('');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
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
    <main className="min-h-screen bg-black text-white">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <div className="hidden lg:block bg-black" />

        <div className="flex items-center justify-center bg-black px-6 py-12">
          <div className="w-full max-w-md rounded-[2rem] border border-border bg-black/95 p-8 backdrop-blur-xl shadow-xl shadow-black/20 sm:p-10">
            <div className="mb-6 space-y-4">
              <div className="flex justify-left">
                <img src="/assets/brand/isologo.png" alt="Logo" className="h-12 w-auto" />
              </div>

              <h2 className="text-3xl font-medium tracking-tight text-white sm:text-3xl">
                Faça login ou crie sua conta grátis!
              </h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-3">
                <InputGeneral
                  id="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Email"
                  className="mt-0"
                />

                <InputGeneral
                  id="password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Senha"
                  className="mt-0"
                />

                <div className="text-right text-sm text-white">
                  <Link to="/recuperar-conta" className="font-regular text-white">
                    Esqueci minha senha
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <ButtonGeneral
                  type="button"
                  onClick={handleSignIn}
                  label="Entrar"
                  loading={isAuthenticating}
                  className="mt-2"
                />

                <div className="text-center text-sm text-white">Ou</div>

                <ButtonGoogle type="button" onClick={handleGoogleSignIn} loading={isGoogleLoading} />

                <div className="pt-2 text-center text-sm text-white/70">
                  Use o usuário de teste abaixo para acessar rapidamente:
                </div>
                <div className="rounded-2xl border border-border bg-white/5 p-3 text-sm text-white">
                  <p><strong>Email:</strong> teste@saldoverde.pro</p>
                  <p><strong>Senha:</strong> Teste123!</p>
                </div>
                <ButtonGeneral
                  type="button"
                  onClick={handleTestUserSignIn}
                  label="Entrar com usuário de teste"
                  loading={isAuthenticating}
                  variant="secondary"
                />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white">
                <span>Não tem conta?</span>
                <Link to="/criar-conta" className="font-semibold text-primary-300 transition hover:text-primary-400">
                  Criar conta
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
