import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete } from '../../lib/auth';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import InputGeneral from '../../components/inputs/input_general';
import ButtonSubmit from '../../components/btn/button_submit';
import ExpensesPreview from '../../components/preview/expenses';
import Snackbar from '../../components/snackbar/snackbar';
import { inferCategoryFromTitle } from '../../data/categories';
import { addRecord, formatAmountFromInput, type RecordItem } from '../../lib/records-storage';

export default function ExpensesPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Outros');
  const [note, setNote] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const [snackbarKey, setSnackbarKey] = useState(0);
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
      console.error('ExpensesPage init error:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Saída | Saldo Verde';
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsSigningOut(true);
    await supabase.auth.signOut();
    setIsSigningOut(false);
    navigate('/login', { replace: true });
  };

  const toggleShowValues = () => setShowValues((current) => !current);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setCategory(inferCategoryFromTitle(value));
  };

  const pad2 = (value: number) => String(value).padStart(2, '0');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !amount.trim() || !note.trim()) {
      setSnackbarType('error');
      setSnackbarMessage('Preencha todos os campos para registrar a saída.');
      setSnackbarKey((current) => current + 1);
      setSnackbarOpen(true);
      return;
    }

    const now = new Date();
    const date = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`;
    const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}H`;
    const amountFormatted = formatAmountFromInput(amount, 'expense');

    const record: RecordItem = {
      type: 'expense',
      title: title.trim(),
      category,
      amount: amountFormatted,
      date,
      time,
      note: note.trim(),
    };

    addRecord(record);
    setSnackbarType('success');
    setSnackbarMessage('Saída registrada com sucesso.');
    setSnackbarKey((current) => current + 1);
    setSnackbarOpen(true);
    setTitle('');
    setAmount('');
    setCategory('Outros');
    setNote('');
  };

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
              <h1 className="text-3xl font-semibold text-white">Registrar nova saída</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Preencha os dados abaixo para registrar uma nova despesa.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-border bg-black/95 p-4 shadow-xl shadow-black/20 sm:p-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputGeneral
                      id="expenseTitle"
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Título da despesa"
                      maxLength={25}
                    />
                    <InputGeneral
                      id="expenseAmount"
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={setAmount}
                      placeholder="Valor (R$)"
                      maxLength={8}
                    />
                  </div>

                  <InputGeneral
                    id="expenseNote"
                    type="text"
                    value={note}
                    onChange={setNote}
                    placeholder="Detalhes"
                    maxLength={40}
                  />

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
                    <ButtonSubmit type="submit" label="Registrar saída" fullWidth={false} />
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-border bg-black/95 p-6 shadow-xl shadow-black/20 sm:p-8">
                <h2 className="text-xl font-semibold text-white mb-4">Preview:</h2>
                <ExpensesPreview title={title} amount={amount} category={category} note={note} />
              </div>
            </div>
          </section>

          <Footer />
        </div>
      </div>

      <Snackbar
        key={snackbarKey}
        open={snackbarOpen}
        message={snackbarMessage}
        type={snackbarType}
        onClose={() => setSnackbarOpen(false)}
      />
    </main>
  );
}
