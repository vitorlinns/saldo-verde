import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient, isProfileComplete, signOutWithBackend } from '../../lib/auth';
import { Power, ShieldCheck, Trash2 } from 'lucide-react';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import ButtonDanger from '../../components/btn/button_danger';
import Modal from '../../components/modal/modal_deleted_account';
import Snackbar from '../../components/snackbar/snackbar';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4001';

export default function ConfigPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingConfirmOpen, setIsDeletingConfirmOpen] = useState(false);
  const [isLogoutAllConfirmOpen, setIsLogoutAllConfirmOpen] = useState(false);
  const [isSigningOutAll, setIsSigningOutAll] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
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
    await signOutWithBackend(supabase);
    setIsSigningOut(false);
    navigate('/login', { replace: true });
  };

  const toggleShowValues = () => setShowValues((current) => !current);

  const handleLogoutAllSessions = () => {
    setIsLogoutAllConfirmOpen(true);
  };

  const confirmLogoutAllSessions = async () => {
    if (!supabase) return;

    setIsLogoutAllConfirmOpen(false);
    setIsSigningOutAll(true);
    setSnackbarType('success');
    setSnackbarMessage('Encerrando todas as sessões...');
    setSnackbarOpen(true);

    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        headers: {
          Authorization: `Bearer ${session.access_token ?? ''}`,
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
    <main className="min-h-screen bg-background text-white">
      <div className="min-h-screen h-full grid w-full gap-6 lg:grid-cols-[280px_1fr] lg:items-stretch">
        <Sidebar
          email={session.user.email ?? null}
          disableProtectedLinks={!isProfileComplete(session)}
        />

        <div className="mr-4 flex min-h-screen flex-col">
          <AppBar
            session={session}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            showValues={showValues}
            onToggleValues={toggleShowValues}
          />

          <section className="flex-1 space-y-6 px-4 pb-8 sm:px-6 lg:px-0">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white">Configurações</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/70">
                    Configure sua conta e ações sensíveis do sistema.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-black/90 p-6 shadow-xl shadow-black/20">
                <h2 className="text-xl font-semibold text-white">Sessão ativa</h2>
                <p className="mt-2 text-sm text-white/70">
                  Saia de todas as sessões ativas para encerrar o acesso em outros os dispositivos.
                </p>
                <p className="mt-4 flex items-center gap-2 text-sm text-white/80">
                  <ShieldCheck className="h-4 w-4" />
                  1 sessão ativa
                </p>
                <div className="mt-4 flex flex-col items-start gap-4">
                  <ButtonDanger
                    type="button"
                    label="Sair de todas as sessões"
                    icon={<Power className="h-4 w-4" />}
                    loading={isSigningOutAll}
                    onClick={handleLogoutAllSessions}
                    className="w-max"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-black/90 p-6 shadow-xl shadow-black/20">
                <h2 className="text-xl font-semibold text-white">Termos e políticas</h2>
                <p className="mt-2 text-sm text-white/70">
                  Tenha sempre acesso rápido aos nossos termos e políticas de uso.
                </p>
                <div className="mt-6 space-y-4">
                  <a
                    href="https://saldoverde.pro/politica-de-privacidade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-border bg-black/80 px-4 py-4 text-sm text-white transition hover:bg-white/5"
                  >
                    Política de privacidade
                  </a>
                  <a
                    href="https://saldoverde.pro/termos-de-uso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl border border-border bg-black/80 px-4 py-4 text-sm text-white transition hover:bg-white/5"
                  >
                    Termos de uso
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-danger bg-danger_bg p-6 shadow-xl shadow-black/20">
              <h2 className="text-xl font-semibold text-white">Área de perigo</h2>
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
