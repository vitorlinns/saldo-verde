import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient, signOutWithBackend } from '../../lib/auth';
import { Globe, Power, Trash2 } from 'lucide-react';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import ButtonDanger from '../../components/btn/button_danger';
import Modal from '../../components/modal/modal_deleted_account';
import Snackbar from '../../components/snackbar/snackbar';

const BACKEND_URL = '/api';

export default function ConfigPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingConfirmOpen, setIsDeletingConfirmOpen] = useState(false);
  const [isLogoutAllConfirmOpen, setIsLogoutAllConfirmOpen] = useState(false);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [activeSessionsCount, setActiveSessionsCount] = useState<number | null>(null);
  const [activeSessionsError, setActiveSessionsError] = useState<string | null>(null);
  const [isFetchingActiveSessions, setIsFetchingActiveSessions] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);

      client.auth.getSession().then(({ data }) => {
        const currentSession = data.session ?? null;
        setSession(currentSession);
        if (!currentSession) {
          navigate('/login', { replace: true });
        }
      });

      const { data: authListener } = client.auth.onAuthStateChange((_event, sessionData) => {
        const currentSession = sessionData ?? null;
        setSession(currentSession);
        if (!currentSession) {
          navigate('/login', { replace: true });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (err) {
      console.error('ConfigPage init error:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Configurações | Saldo Verde';
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsSigningOut(true);
    try {
      await signOutWithBackend(supabase);
    } finally {
      setIsSigningOut(false);
      navigate('/login', { replace: true });
    }
  };

  const toggleShowValues = () => setShowValues((current) => !current);

  const handleLogoutAllSessions = () => {
    setIsLogoutAllConfirmOpen(true);
  };

  useEffect(() => {
    if (!session) {
      setActiveSessionsCount(null);
      setActiveSessionsError(null);
      setIsFetchingActiveSessions(false);
      return;
    }

    const currentSession = session;

    setIsFetchingActiveSessions(true);

    const fetchActiveSessionsCount = async () => {
      try {
        setActiveSessionsError(null);

        const requestCount = async (accessToken: string) => {
          return fetch(`${BACKEND_URL}/auth/sessions`, {
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        };

        let latestSession = supabase
          ? (await supabase.auth.getSession()).data.session ?? currentSession
          : currentSession;

        let response = await requestCount(latestSession.access_token);

        if (response.status === 401) {
          const refreshResponse = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            const refreshPayload = await refreshResponse.json().catch(() => null);
            const refreshedSession = refreshPayload?.session ?? null;

            if (supabase && refreshedSession) {
              const { error: setSessionError } = await supabase.auth.setSession(refreshedSession);
              if (setSessionError) {
                console.warn('Failed to sync refreshed session in frontend:', setSessionError);
              }
            }

            latestSession = supabase
              ? (await supabase.auth.getSession()).data.session ?? latestSession
              : latestSession;

            response = await requestCount(latestSession.access_token);
          }
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => '');
          console.error('Failed to fetch active sessions count:', response.status, errorText);
          setActiveSessionsError(`Erro ${response.status}`);
          return;
        }

        const result = await response.json();
        setActiveSessionsCount((previous) => (typeof result.count === 'number' ? result.count : previous));
      } catch (error) {
        console.error('Failed to fetch active sessions count:', error);
        setActiveSessionsError('Falha de rede');
      } finally {
        setIsFetchingActiveSessions(false);
      }
    };

    void fetchActiveSessionsCount();
  }, [session, supabase]);

  const confirmLogoutAllSessions = async () => {
    if (!supabase || !session) return;

    setIsLogoutAllConfirmOpen(false);
    setIsSigningOutAll(true);
    setSnackbarType('success');
    setSnackbarMessage('Encerrando todas as sessões...');
    setSnackbarOpen(true);

    try {
      const latestSession = (await supabase.auth.getSession()).data.session ?? session;

      await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${latestSession.access_token}`,
        },
      });

      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        setSnackbarType('error');
        setSnackbarMessage(error.message || 'Não foi possível encerrar todas as sessões.');
      } else {
        setSnackbarType('success');
        setSnackbarMessage('Todas as sessões foram encerradas.');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Logout all sessions error:', err);
      setSnackbarType('error');
      setSnackbarMessage('Erro ao encerrar todas as sessões. Tente novamente.');
    } finally {
      setIsSigningOutAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingConfirmOpen(true);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!session || !supabase) return;

    setIsDeleting(true);
    setIsDeletingConfirmOpen(false);
    setSnackbarType('success');
    setSnackbarMessage('Excluindo sua conta...');
    setSnackbarOpen(true);

    try {
      const response = await fetch(`${BACKEND_URL}/account/${session.user.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setSnackbarType('error');
        setSnackbarMessage(result.error || 'Não foi possível excluir a conta.');
      } else {
        setSnackbarType('success');
        setSnackbarMessage(result.message || 'Conta excluída com sucesso.');
        await signOutWithBackend(supabase);
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setSnackbarType('error');
      setSnackbarMessage('Erro ao excluir a conta. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-bg_saas text-white">
      <div className="min-h-screen h-full grid w-full gap-6 xl:grid-cols-[280px_1fr] xl:items-stretch">
        <Sidebar
          email={session.user.email ?? null}
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="mx-4 xl:mr-4 xl:mx-0 flex min-h-screen flex-col">
          <AppBar
            session={session}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            showValues={showValues}
            onToggleValues={toggleShowValues}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />

          <section className="flex-1 space-y-6 pb-8">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-regular text-white">Configurações</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/70">
                    Configure sua conta e ações sensíveis do sistema.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[0.5rem] border border-border bg-surface p-6">
                <h2 className="text-xl font-regular text-white">Dispositivos conectados</h2>
                <p className="mt-2 text-sm text-white/70">
                  Veja em quantos dispositivos sua conta está conectada e encerre o acesso em todos eles, se necessário.
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm text-white/80">
                  <Globe className="h-4 w-4" />
                  {isFetchingActiveSessions
                    ? 'Carregando dispositivos...'
                    : activeSessionsError
                    ? `Não foi possível carregar os dispositivos conectados (${activeSessionsError}).`
                    : activeSessionsCount === null
                    ? 'Não foi possível carregar os dispositivos conectados.'
                    : activeSessionsCount === 0
                    ? 'Nenhum dispositivo conectado'
                    : `${activeSessionsCount} ${activeSessionsCount === 1 ? 'dispositivo conectado' : 'dispositivos conectados'}`}
                </p>
                <div className="mt-4 flex flex-col items-start gap-4">
                  <ButtonDanger
                    type="button"
                    label="Sair de todos os dispositivos"
                    icon={<Power className="h-4 w-4" />}
                    loading={isSigningOutAll}
                    onClick={handleLogoutAllSessions}
                    className="w-max"
                  />
                </div>
              </div>

              <div className="rounded-[0.5rem] border border-border bg-surface p-6">
                <h2 className="text-xl font-regular text-white">Termos e políticas</h2>
                <p className="mt-2 text-sm text-white/70">
                  Tenha sempre acesso rápido aos nossos termos e políticas de uso.
                </p>
                <div className="mt-6 space-y-4">
                  <a
                    href="https://saldoverde.pro/politica-de-privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-[0.5rem] border border-border bg-surface px-4 py-4 text-sm text-white transition hover:bg-white/5"
                  >
                    Política de privacidade
                  </a>
                  <a
                    href="https://saldoverde.pro/termos-de-uso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-[0.5rem] border border-border bg-surface px-4 py-4 text-sm text-white transition hover:bg-white/5"
                  >
                    Termos de uso
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-[0.5rem] border border-danger bg-danger_bg p-6">
              <h2 className="text-xl font-regular text-danger">Área de perigo!</h2>
              <p className="mt-2 text-sm text-white/70">
                Você pode excluir sua conta a qualquer momento, porém não será possível criar nova conta com mesmo e-mail e cpf já cadastrados. Para mais informções e tirar dúvidas, consulte nossos termos e políticas.
              </p>
              <div className="mt-6 space-y-4">
                
                <ButtonDanger
                  type="button"
                  label="Excluir conta"
                  icon={<Trash2 className="h-4 w-4" />}
                  loading={isDeleting}
                  onClick={handleDeleteAccount}
                  className="w-max px-5"
                />
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>

      <Modal
        open={isDeletingConfirmOpen}
        title="Confirmar exclusão da conta"
        description="A exclusão da conta é permanente e encerrará seu acesso imediatamente."
        warning="Podemos reservar seus dados por até 5 anos para cumprir obrigações legais e impedir novo cadastro com o mesmo email ou CPF."
        confirmLabel="Excluir conta"
        cancelLabel="Cancelar"
        loading={isDeleting}
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setIsDeletingConfirmOpen(false)}
      />
      <Modal
        open={isLogoutAllConfirmOpen}
        title="Sair de todas as sessões"
        description="Deseja encerrar todas as sessões ativas? Isso desconectará sua conta de todos os dispositivos onde você estiver logado."
        warning="Essa ação irá deslogar sua conta globalmente em todos os dispositivos e navegadores."
        confirmLabel="Confirmar logout"
        confirmIcon={<Power className="h-4 w-4" />}
        cancelLabel="Cancelar"
        loading={isSigningOutAll}
        onConfirm={confirmLogoutAllSessions}
        onCancel={() => setIsLogoutAllConfirmOpen(false)}
      />

      <Snackbar
        open={snackbarOpen}
        message={snackbarMessage}
        type={snackbarType}
        onClose={() => setSnackbarOpen(false)}
      />
    </main>
  );
}
