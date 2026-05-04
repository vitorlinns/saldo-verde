import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete, signOutWithBackend } from '../../lib/auth';
import { useSession } from '../../contexts/session-context';
import type { SupabaseClient } from '@supabase/supabase-js';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import InputGeneral from '../../components/inputs/input_general';
import ButtonSubmit from '../../components/btn/button_submit';
import EntrancePreview from '../../components/preview/entrance';
import Snackbar from '../../components/snackbar/snackbar';
import ModalNotice from '../../components/modal/modal_notice';
import { inferCategoryFromTitle } from '../../data/categories';
import { addRecord, formatAmountFromInput, type RecordItem } from '../../lib/records-storage';

export default function EntrancePage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
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
  const [showProfileNotice, setShowProfileNotice] = useState(false);
  const { session } = useSession();
  const navigate = useNavigate();
  const profileComplete = isProfileComplete(session);

  useEffect(() => {
    const client = createClient();
    setSupabase(client);
  }, []);

  useEffect(() => {
    document.title = 'Entrada | Saldo Verde';
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

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setCategory(inferCategoryFromTitle(value));
  };

  const pad2 = (value: number) => String(value).padStart(2, '0');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profileComplete) {
      setShowProfileNotice(true);
      return;
    }

    if (!title.trim() || !amount.trim() || !note.trim()) {
      setSnackbarType('error');
      setSnackbarMessage('Preencha todos os campos para registrar a entrada.');
      setSnackbarKey((current) => current + 1);
      setSnackbarOpen(true);
      return;
    }

    const now = new Date();
    const date = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`;
    const time = `${pad2(now.getHours())}:${pad2(now.getMinutes())}H`;
    const amountFormatted = formatAmountFromInput(amount, 'income');

    const record: RecordItem = {
      type: 'income',
      title: title.trim(),
      category,
      amount: amountFormatted,
      date,
      time,
      note: note.trim(),
    };

    addRecord(record);
    setSnackbarType('success');
    setSnackbarMessage('Entrada registrada com sucesso.');
    setSnackbarKey((current) => current + 1);
    setSnackbarOpen(true);
    setTitle('');
    setAmount('');
    setCategory('Outros');
    setNote('');
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
              <h1 className="text-3xl font-regular text-white">Registrar nova entrada</h1>
              <p className="mt-4 max-w-2xl text-sm text-white/70">
                Preencha os dados abaixo para registrar um novo recebimento.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border border-border bg-surface p-4 shadow-xl shadow-black/20 sm:p-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <InputGeneral
                      id="entryTitle"
                      type="text"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Título da receita"
                      maxLength={25}
                    />
                    <InputGeneral
                      id="entryAmount"
                      type="text"
                      inputMode="decimal"
                      value={amount}
                      onChange={setAmount}
                      placeholder="Valor (R$)"
                      maxLength={8}
                    />
                  </div>

                  <InputGeneral
                    id="entryNote"
                    type="text"
                    value={note}
                    onChange={setNote}
                    placeholder="Detalhes"
                    maxLength={20}
                  />

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
                    <ButtonSubmit type="submit" label="Registrar entrada" fullWidth={false} />
                  </div>
                </form>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6 shadow-xl shadow-black/20 sm:p-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-white">Preview:</h2>
                  <EntrancePreview title={title} amount={amount} category={category} note={note} />
                </div>
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

      <ModalNotice
        open={showProfileNotice}
        title="Complete seu cadastro"
        description="Para registrar entradas, é necessário completar o cadastro do seu perfil. Acesse seu perfil e finalize as informações obrigatórias."
        onClose={() => setShowProfileNotice(false)}
        onAction={() => navigate('/perfil')}
      />
    </main>
  );
}
