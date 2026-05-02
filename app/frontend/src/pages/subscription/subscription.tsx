import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBrowserSupabaseClient } from 'saldo-verde-supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { CreditCard, ShieldCheck, Clock3, Star } from 'lucide-react';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import { isProfileComplete } from '../../lib/auth';

const createClient = (): SupabaseClient => createBrowserSupabaseClient();

const formatPlanLabel = (plan?: string) => {
  const normalized = plan?.toLowerCase().trim() ?? '';
  if (!normalized || normalized.includes('free') || normalized.includes('gratuito') || normalized.includes('teste')) {
    return 'Teste grátis';
  }

  if (normalized.includes('premium') || normalized.includes('pro') || normalized.includes('pago')) {
    return 'Plano pago';
  }

  return plan ?? 'Teste grátis';
};

const parseStatusLabel = (status?: string, plan?: string) => {
  const normalized = status?.toLowerCase().trim() ?? '';
  if (normalized.includes('active') || normalized.includes('ativo')) {
    return 'Ativo';
  }
  if (normalized.includes('canceled') || normalized.includes('cancelado') || normalized.includes('inativo')) {
    return 'Cancelado';
  }
  if (normalized.includes('trial') || normalized.includes('teste')) {
    return 'Período de teste';
  }
  if (plan && plan.toLowerCase().includes('free')) {
    return 'Período de teste';
  }
  return 'Ativo';
};

export default function SubscriptionPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
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
      console.error('SubscriptionPage init error:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Minha assinatura | Saldo Verde';
  }, []);

  if (!session) {
    return null;
  }

  const metadata = session.user.user_metadata as Record<string, unknown> | undefined;
  const rawPlan = typeof metadata?.subscription_plan === 'string'
    ? metadata.subscription_plan
    : typeof metadata?.plan === 'string'
    ? metadata.plan
    : typeof metadata?.billing_plan === 'string'
    ? metadata.billing_plan
    : 'Teste grátis';

  const rawStatus = typeof metadata?.subscription_status === 'string'
    ? metadata.subscription_status
    : typeof metadata?.status === 'string'
    ? metadata.status
    : rawPlan.toLowerCase().includes('free')
    ? 'Período de teste'
    : 'Ativo';

  const planLabel = formatPlanLabel(String(rawPlan));
  const statusLabel = parseStatusLabel(String(rawStatus), String(rawPlan));
  const nextBilling = typeof metadata?.next_billing_date === 'string'
    ? metadata.next_billing_date
    : typeof metadata?.billing_date === 'string'
    ? metadata.billing_date
    : 'Não disponível';
  const planValue = typeof metadata?.plan_value === 'string'
    ? metadata.plan_value
    : typeof metadata?.price === 'string'
    ? metadata.price
    : planLabel === 'Teste grátis'
    ? 'R$ 0,00'
    : 'Consultar valor';

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
            onSignOut={async () => {
              if (!supabase) return;
              await supabase.auth.signOut();
              navigate('/login', { replace: true });
            }}
            isSigningOut={false}
            showValues={showValues}
            onToggleValues={() => setShowValues((current) => !current)}
          />

          <section className="flex-1 space-y-6 px-4 pb-8 sm:px-6 lg:px-0">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white">Minha assinatura</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/70">
                    Veja aqui o plano ativo e o status atual da sua assinatura.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-black/90 p-6 shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 text-white">
                  <CreditCard className="h-5 w-5 text-primary-400" />
                  <h2 className="text-xl font-semibold">Plano ativo</h2>
                </div>
                <p className="mt-4 text-sm text-white/70">
                  O plano exibido abaixo corresponde à configuração atual da sua conta.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-border bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Plano</p>
                    <p className="mt-2 text-lg font-semibold text-white">{planLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Status</p>
                    <p className="mt-2 text-lg font-semibold text-white">{statusLabel}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-black/90 p-6 shadow-xl shadow-black/20">
                <div className="flex items-center gap-3 text-white">
                  <ShieldCheck className="h-5 w-5 text-primary-400" />
                  <h2 className="text-xl font-semibold">Detalhes da assinatura</h2>
                </div>
                <div className="mt-6 space-y-4 text-sm text-white/70">
                  <div className="rounded-2xl border border-border bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Valor do plano</p>
                    <p className="mt-2 text-lg font-semibold text-white">{planValue}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Próximo pagamento</p>
                    <p className="mt-2 text-lg font-semibold text-white">{nextBilling}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Validade</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {statusLabel === 'Período de teste' ? 'Até o fim do teste' : 'Renovação automática'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-black/90 p-6 shadow-xl shadow-black/20">
              <div className="flex items-center gap-3 text-white">
                <Star className="h-5 w-5 text-primary-400" />
                <h2 className="text-xl font-semibold">O que você pode fazer</h2>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-white/70">
                <li>• Ver o status atual do seu plano.</li>
                <li>• Confirmar se você está em período de teste ou assinatura ativa.</li>
                <li>• Consultar o próximo pagamento e valor do plano atual.</li>
              </ul>
            </div>
          </section>

          <Footer />
        </div>
      </div>
    </main>
  );
}
