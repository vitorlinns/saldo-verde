import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBrowserSupabaseClient } from 'saldo-verde-supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import ButtonGeneral from '../../components/btn/button_general';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import FinanceWidget from '../../components/widgets/finance';
import HealthWidget from '../../components/widgets/health';
import ActionsWidget from '../../components/widgets/actions';
import HistoricalWidget from '../../components/widgets/historical';
import Graphic from '../../components/widgets/graphic';
import Footer from '../../components/footer/footer';

const createClient = (): SupabaseClient => createBrowserSupabaseClient();

export default function DashboardPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
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
      console.error('Dashboard init error:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    navigate('/login', { replace: true });
  };

  const totalEntradas = 29357;
  const totalSaidas = 2300;
  const saldoTotal = totalEntradas - totalSaidas;

  const toggleShowValues = () => setShowValues((current) => !current);

  useEffect(() => {
    document.title = 'Dashboard | Saldo Verde';
  }, []);

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="min-h-screen h-full grid w-full gap-6 lg:grid-cols-[280px_1fr] lg:items-stretch">
        <Sidebar email={session?.user.email ?? null} />

        <div className="mr-4">
          <AppBar
            session={session}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            showValues={showValues}
            onToggleValues={toggleShowValues}
          />

          <section className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              <FinanceWidget
                title="Saldo total"
                value={saldoTotal}
                description="Disponível após todas as entradas e saídas"
                variant="primary"
                showValues={showValues}
              />
              <FinanceWidget
                title="Entradas"
                value={totalEntradas}
                description="Total de dinheiro registrado"
                variant="success"
                showValues={showValues}
              />
              <FinanceWidget
                title="Saídas"
                value={totalSaidas}
                description="Total de saídas registradas"
                variant="danger"
                showValues={showValues}
              />
            </div>

            <Graphic totalEntradas={totalEntradas} totalSaidas={totalSaidas} showValues={showValues} />

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] items-stretch">
              <div className="space-y-6 h-full">
                <HistoricalWidget showValues={showValues} />
              </div>

              <aside className="flex h-full flex-col gap-6">
                <HealthWidget totalEntradas={totalEntradas} totalSaidas={totalSaidas} showValues={showValues} />

                <div className="mt-auto">
                  <ActionsWidget />
                </div>
              </aside>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </main>
  );
}
