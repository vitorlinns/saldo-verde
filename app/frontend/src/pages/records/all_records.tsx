import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete, signOutWithBackend } from '../../lib/auth';
import { useSession } from '../../contexts/session-context';
import type { SupabaseClient } from '@supabase/supabase-js';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import Pagination from '../../components/pagination/pagination';
import FilterRecords from '../../components/filter/filter_records';
import SearchRecords from '../../components/filter/search_records';
import AllRecordsCard from '../../components/cards/all_records';
import ButtonSubmit from '../../components/btn/button_submit';
import ModalNotice from '../../components/modal/modal_notice';
import DownloadRecords from '../../components/download/download_records';
import { getStoredRecords, type RecordItem } from '../../lib/records-storage';

export default function AllRecordsPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDay, setFilterDay] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [showProfileNotice, setShowProfileNotice] = useState(false);
  const { session } = useSession();
  const navigate = useNavigate();
  const profileComplete = isProfileComplete(session);

  useEffect(() => {
    setRecords(getStoredRecords());
  }, []);

  useEffect(() => {
    document.title = 'Registros | Saldo Verde';
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

  const normalizeDigits = (value: string) => value.replace(/[^0-9]/g, '');

  const filteredRecords = records.filter((record) => {
    const [day, month, year] = record.date.split('/');
    const matchesDay = !filterDay || day === filterDay.padStart(2, '0');
    const matchesMonth = !filterMonth || month === filterMonth.padStart(2, '0');
    const matchesYear = !filterYear || year === filterYear;

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const numericSearch = normalizeDigits(normalizedSearch);
    const amountMatch = numericSearch.length > 0 && normalizeDigits(record.amount).includes(numericSearch);
    const matchesSearch =
      normalizedSearch.length < 3 ||
      [record.title, record.category, record.amount]
        .map((field) => field.toLowerCase())
        .some((value) => value.includes(normalizedSearch)) ||
      amountMatch;

    return matchesDay && matchesMonth && matchesYear && matchesSearch;
  });

  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const resetFilter = () => {
    setFilterDay('');
    setFilterMonth('');
    setFilterYear('');
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="min-h-screen h-full grid w-full gap-6 xl:grid-cols-[280px_1fr] xl:items-stretch">
<Sidebar email={session?.user.email ?? null} />

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
              <h1 className="text-3xl font-regular text-white">Todos os registros</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Confira seus lançamentos recentes e acompanhe seus valores em um só lugar.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_1.2fr] items-end">
              <FilterRecords
                day={filterDay}
                month={filterMonth}
                year={filterYear}
                records={filteredRecords}
                printedByName={
                  typeof session?.user.user_metadata?.first_name === 'string'
                    ? session.user.user_metadata.first_name
                    : session?.user.email?.split('@')[0] ?? 'Usuário'
                }
                printedByEmail={session?.user.email ?? 'sem-email@saldoverde.pro'}
                onDayChange={(value) => {
                  setFilterDay(value);
                  setCurrentPage(1);
                }}
                onMonthChange={(value) => {
                  setFilterMonth(value);
                  setCurrentPage(1);
                }}
                onYearChange={(value) => {
                  setFilterYear(value);
                  setCurrentPage(1);
                }}
                onReset={resetFilter}
                showDownload={false}
                downloadComponent={
                  profileComplete ? (
                    <DownloadRecords
                      records={filteredRecords}
                      filename={`registros-${filterMonth || 'todos'}-${filterYear || 'todos'}.pdf`}
                      printedByName={
                        typeof session?.user.user_metadata?.first_name === 'string'
                          ? session.user.user_metadata.first_name
                          : session?.user.email?.split('@')[0] ?? 'Usuário'
                      }
                      printedByEmail={session?.user.email ?? 'sem-email@saldoverde.pro'}
                    />
                  ) : (
                    <ButtonSubmit
                      type="button"
                      label="Baixar PDF"
                      icon={<Download className="h-4 w-4" />}
                      onClick={() => setShowProfileNotice(true)}
                      fullWidth={false}
                    />
                  )
                }
              />

              <SearchRecords query={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-black/95 shadow-xl shadow-black/20">
              <table className="min-w-full table-fixed border-collapse text-left">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.10em] text-white/60">
                  <tr>
                    <th className="w-[12%] px-6 py-4 font-medium">Tipo</th>
                    <th className="w-[18%] px-6 py-4 font-medium">Título</th>
                    <th className="w-[16%] px-6 py-4 font-medium">Categoria</th>
                    <th className="w-[14%] px-6 py-4 font-medium">Valor</th>
                    <th className="w-[10%] px-6 py-4 font-medium">Data</th>
                    <th className="w-[10%] px-6 py-4 font-medium">Horário</th>
                    <th className="w-[24%] px-6 py-4 font-medium">Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record, index) => (
                    <AllRecordsCard
                      key={`${record.title}-${record.date}-${index}`}
                      type={record.type}
                      title={record.title}
                      category={record.category}
                      amount={record.amount}
                      date={record.date}
                      time={record.time}
                      note={record.note}
                    />
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col gap-3 border-t border-white/10 bg-black/95 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-white/70">
                  Mostrando {currentRecords.length} de {filteredRecords.length} registros
                </span>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handleChangePage}
                />
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>

      <ModalNotice
        open={showProfileNotice}
        title="Complete seu cadastro"
        description="Para baixar o PDF de todos os registros, é necessário completar o cadastro do seu perfil. Acesse seu perfil e finalize as informações obrigatórias."
        onClose={() => setShowProfileNotice(false)}
        onAction={() => {
          setShowProfileNotice(false);
          navigate('/perfil');
        }}
      />
    </main>
  );
}
