import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete } from '../../lib/auth';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import FinanceWidget from '../../components/widgets/finance';
import Graphic from '../../components/widgets/graphic';
import FilterRecords from '../../components/filter/filter_records';
import DownloadReports from '../../components/download/download_reports';
import {
  getMonthlySummaries,
  getStoredBalance,
  getStoredRecords,
  parseAmount,
  type MonthlySummary,
  type RecordItem,
} from '../../lib/records-storage';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const monthLabels = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const getDownloadFilename = (prefix: string, month?: string, year?: string) => {
  const now = new Date();
  const normalizedMonth = month ? month.padStart(2, '0') : '';
  const normalizedYear = year || '';

  const useCurrentDate = !normalizedMonth && !normalizedYear;
  const monthForLabel = useCurrentDate
    ? String(now.getMonth() + 1).padStart(2, '0')
    : normalizedMonth;
  const yearForLabel = useCurrentDate ? String(now.getFullYear()) : normalizedYear;
  const monthLabel = monthForLabel
    ? monthLabels[Number(monthForLabel) - 1]?.toLowerCase() ?? monthForLabel
    : '';

  if (monthLabel && yearForLabel) {
    return `${prefix}-${monthLabel}-${yearForLabel}.pdf`;
  }
  if (monthLabel) {
    return `${prefix}-${monthLabel}.pdf`;
  }
  if (yearForLabel) {
    return `${prefix}-${yearForLabel}.pdf`;
  }
  return `${prefix}.pdf`;
};

const getFilterLabel = (month?: string, year?: string) => {
  if (month && year) {
    const index = Number(month) - 1;
    return `${monthLabels[index] ?? month} ${year}`;
  }

  if (month) {
    const index = Number(month) - 1;
    return monthLabels[index] ?? month;
  }

  return year ?? '';
};

const normalizeMonth = (value?: string) => {
  const month = value?.trim() ?? '';
  return month ? month.padStart(2, '0') : '';
};

const normalizeYear = (value?: string) => {
  const year = value?.trim() ?? '';
  return year.length === 4 ? year : '';
};

const getCurrentMonth = () => String(new Date().getMonth() + 1).padStart(2, '0');

const buildChartDataFromRecords = (
  records: RecordItem[],
  month?: string,
  year?: string,
) => {
  const normalizedMonth = normalizeMonth(month);
  const normalizedYear = normalizeYear(year);

  if (normalizedMonth && normalizedYear) {
    const dailyMap = new Map<string, { entradas: number; saidas: number }>();

    records.forEach((record) => {
      const [day, recordMonth, recordYear] = record.date.split('/');
      if (!day || !recordMonth || !recordYear) return;
      if (recordMonth.padStart(2, '0') !== normalizedMonth || recordYear !== normalizedYear) return;

      const dayKey = day.padStart(2, '0');
      const amount = parseAmount(record.amount);
      const current = dailyMap.get(dayKey) ?? { entradas: 0, saidas: 0 };

      if (record.type === 'income') {
        current.entradas += amount;
      } else {
        current.saidas += amount;
      }

      dailyMap.set(dayKey, current);
    });

    const daysInMonth = new Date(Number(normalizedYear), Number(normalizedMonth), 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      const values = dailyMap.get(day) ?? { entradas: 0, saidas: 0 };

      return {
        label: `${day}/${normalizedMonth}`,
        entradas: values.entradas,
        saidas: values.saidas,
      };
    });
  }

  const monthlySummaries = getMonthlySummaries(6, {
    month: normalizedMonth || undefined,
    year: normalizedYear || undefined,
  });

  if (normalizedYear) {
    return monthlySummaries.map((summary) => ({
      label: summary.label,
      entradas: summary.totalIncome,
      saidas: summary.totalExpense,
    }));
  }

  const currentDate = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const monthIndex = currentDate.getMonth() - (5 - index);
    const date = new Date(currentDate.getFullYear(), monthIndex, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const summary = monthlySummaries.find((item) => item.monthKey === monthKey);

    return {
      label: `${monthLabels[date.getMonth()]} ${date.getFullYear()}`,
      entradas: summary?.totalIncome ?? 0,
      saidas: summary?.totalExpense ?? 0,
    };
  });
};

export default function ReportsPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const normalizedMonth = normalizeMonth(filterMonth);
  const normalizedYear = normalizeYear(filterYear);
  const monthlySummariesRaw = getMonthlySummaries(6, {
    month: normalizedMonth || undefined,
    year: normalizedYear || undefined,
  });
  const monthlySummaries =
    monthlySummariesRaw.length === 0 && (normalizedMonth || normalizedYear)
      ? [
          {
            monthKey:
              normalizedYear && normalizedMonth
                ? `${normalizedYear}-${normalizedMonth}`
                : `0000-${normalizedMonth || '01'}`,
            label: getFilterLabel(normalizedMonth || undefined, normalizedYear || undefined),
            totalIncome: 0,
            totalExpense: 0,
            netAmount: 0,
            recordCount: 0,
          },
        ]
      : monthlySummariesRaw;
  const storedRecords = getStoredRecords();
  const chartData = buildChartDataFromRecords(storedRecords, normalizedMonth, normalizedYear);
  const [balance] = useState(() => getStoredBalance());
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
          return;
        }

        if (!isProfileComplete(currentSession)) {
          navigate('/perfil', { replace: true });
        }
      });

      const { data: authListener } = client.auth.onAuthStateChange((_event, sessionData) => {
        const currentSession = sessionData ?? null;
        setSession(currentSession);
        if (!currentSession) {
          navigate('/login', { replace: true });
          return;
        }

        if (!isProfileComplete(currentSession)) {
          navigate('/perfil', { replace: true });
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (err) {
      console.error('ReportsPage init error:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Relatório | Saldo Verde';
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    navigate('/login', { replace: true });
  };

  const toggleShowValues = () => setShowValues((current) => !current);

  const selectedSummary = monthlySummaries[0];
  const selectedLabel = selectedSummary?.label ?? 'mês selecionado';

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="min-h-screen h-full grid w-full gap-6 lg:grid-cols-[280px_1fr] lg:items-stretch">
<Sidebar email={session?.user.email ?? null} disableProtectedLinks={session ? !isProfileComplete(session) : false} />

        <div className="mr-4 flex min-h-screen flex-col">
          <AppBar
            session={session}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            showValues={showValues}
            onToggleValues={toggleShowValues}
          />

          <section className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-semibold text-white">Relatório</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Veja como seus meses anteriores se comportaram e acompanhe o saldo acumulado.
              </p>
            </div>

            <FilterRecords
              title="Filtrar meses"
              description="Selecione mês e ano para ver o relatório desse período."
              day=""
              month={filterMonth}
              year={filterYear}
              onMonthChange={setFilterMonth}
              onYearChange={(value) => {
                const normalized = value.trim();
                setFilterYear(value);
                if (normalized) {
                  setFilterMonth((currentMonth) => currentMonth || getCurrentMonth());
                } else {
                  setFilterMonth('');
                }
              }}
              onReset={() => {
                setFilterMonth('');
                setFilterYear('');
              }}
              records={[]}
              showDayFilter={false}
              showDownload={false}
              downloadComponent={
                <DownloadReports
                  balance={balance}
                  selectedSummary={monthlySummaries[0]}
                  month={filterMonth}
                  year={filterYear}
                  monthlySummaries={monthlySummaries}
                  filename={getDownloadFilename('relatorio', filterMonth, filterYear)}
                  printedByName={
                    typeof session?.user.user_metadata?.first_name === 'string'
                      ? session.user.user_metadata.first_name
                      : session?.user.email ?? 'Usuário'
                  }
                  printedByEmail={session?.user.email ?? 'sem-email@saldoverde.pro'}
                />
              }
            />

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              <FinanceWidget
                title="Saldo total"
                value={balance}
                description="Saldo total disponível"
                variant="primary"
                showValues={showValues}
              />
              <FinanceWidget
                title="Entradas"
                value={selectedSummary?.totalIncome ?? 0}
                description={selectedSummary ? `Entradas de ${selectedLabel}` : 'Sem dados para o mês'}
                variant="success"
                showValues={showValues}
              />
              <FinanceWidget
                title="Saídas"
                value={selectedSummary?.totalExpense ?? 0}
                description={selectedSummary ? `Saídas de ${selectedLabel}` : 'Sem dados para o mês'}
                variant="danger"
                showValues={showValues}
              />
            </div>

            <Graphic data={chartData} showValues={showValues} />

          </section>

          <Footer />
        </div>
      </div>
    </main>
  );
}
