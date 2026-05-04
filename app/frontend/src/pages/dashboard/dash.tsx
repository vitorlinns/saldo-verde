import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete, signOutWithBackend } from '../../lib/auth';
import { useSession } from '../../contexts/session-context';
import type { SupabaseClient } from '@supabase/supabase-js';
import ButtonGeneral from '../../components/btn/button_general';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import FinanceWidget from '../../components/widgets/finance';
import HealthWidget from '../../components/widgets/health';
import ActionsWidget from '../../components/widgets/actions';
import HistoricalWidget from '../../components/widgets/historical';
import Graphic from '../../components/widgets/graphic';
import Footer from '../../components/footer/footer';
import {
  getAllMonthlySummaries,
  getMonthlySummaries,
  getRecentRecords,
  getStoredBalance,
  getStoredRecords,
  parseAmount,
  type RecordItem,
} from '../../lib/records-storage';

export default function DashboardPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { session } = useSession();
  const recentRecords = getRecentRecords(5);
  const balance = getStoredBalance();
  const monthlyRecords = getStoredRecords();
  const navigate = useNavigate();

  useEffect(() => {
    const client = createClient();
    setSupabase(client);
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

  const totalEntradas = monthlyRecords.reduce((sum, record) => {
    return record.type === 'income' ? sum + parseAmount(record.amount) : sum;
  }, 0);

  const totalSaidas = monthlyRecords.reduce((sum, record) => {
    return record.type === 'expense' ? sum + parseAmount(record.amount) : sum;
  }, 0);

  const monthLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const allSummaries = getAllMonthlySummaries();
  const summaryMap = new Map(allSummaries.map((summary) => [summary.monthKey, summary]));
  const currentDate = new Date();

  const chartData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + index, 1);
    const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    const summary = summaryMap.get(monthKey);

    return {
      label: `${monthLabels[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
      entradas: summary?.totalIncome ?? 0,
      saidas: summary?.totalExpense ?? 0,
    };
  });

  const saldoTotal = balance;

  const toggleShowValues = () => setShowValues((current) => !current);

  useEffect(() => {
    document.title = 'Dashboard | Saldo Verde';
  }, []);

  return (
    <main className="min-h-screen bg-bg_saas text-white">
      <div className="min-h-screen h-full grid w-full gap-6 xl:grid-cols-[280px_1fr] xl:items-stretch">
<Sidebar
          email={session?.user.email ?? null}
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

          <section className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-regular text-white">Dashboard</h1>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              <FinanceWidget
                title="Saldo total"
                value={saldoTotal}
                description="Saldo líquido disponível"
                variant="primary"
                showValues={showValues}
              />
              <FinanceWidget
                title="Entradas"
                value={totalEntradas}
                description="Total de entradas esse mês"
                variant="success"
                showValues={showValues}
              />
              <FinanceWidget
                title="Saídas"
                value={totalSaidas}
                description="Total de saídas esse mês"
                variant="danger"
                showValues={showValues}
              />
            </div>

            <Graphic data={chartData} showValues={showValues} />

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] items-stretch">
              <div className="space-y-6 h-full">
                <HistoricalWidget showValues={showValues} records={recentRecords} />
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
