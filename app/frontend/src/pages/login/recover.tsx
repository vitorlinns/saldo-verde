import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonGeneral from '../../components/btn/button_general';
import AuthSidePanel from '../../components/login/auth-side-panel';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';
import InputGeneral from '../../components/inputs/input_general';
import { safeParseJson } from '../../lib/http';

const BACKEND_URL = '/api';

export default function RecoverPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  const handleRecover = async () => {
    if (!email.trim()) {
      setError('Informe seu email para continuar.');
      setMessage('');
      return;
    }

    setError('');
    setMessage('');
    setIsSending(true);

    try {
      const response = await fetch(`${BACKEND_URL}/recover/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await safeParseJson<{ message?: string; error?: string }>(response);
      if (!response.ok) {
        setError(
          typeof data === 'object' && 'error' in data
            ? data.error || 'Não foi possível enviar o email de recuperação.'
            : 'Não foi possível enviar o email de recuperação.'
        );
      } else {
        sessionStorage.setItem('recoverEmail', email.trim().toLowerCase());
        setMessage(data && typeof data === 'object' && 'message' in data
          ? data.message || 'Se o email existir, você receberá instruções de recuperação.'
          : 'Se o email existir, você receberá instruções de recuperação.');
        navigate('/recuperar-conta/codigo');
      }
    } catch (err) {
      console.error('Recover request error:', err);
      setError('Ocorreu um erro ao enviar o pedido de recuperação. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <AuthSidePanel />

        <div className="relative overflow-hidden flex items-center justify-center bg-background px-6 py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(130,222,127,0.10),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.012),transparent_28%)]" />
          <div className="relative z-10 w-full max-w-md rounded-[1rem] border border-border bg-surface p-8 sm:p-10">
            <div className="mb-6 space-y-4">
              <div className="flex justify-left">
                <img src="/assets/brand/isologo.webp" alt="Logo" className="h-12 w-auto" />
              </div>

              <div>
                <h2 className="text-3xl font-regular tracking-tight text-white sm:text-3xl">
                  Recuperar conta
                </h2>
                <p className="mt-2 text-regurlar text-white/70">
                  Informe o email cadastrado para receber o código de verificação.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <InputGeneral
                id="recover-email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Digite seu e-mail"
                className="mt-0"
                maxLength={45}
                autoComplete="email"
              />

              <ButtonGeneral
                type="button"
                onClick={handleRecover}
                label="Enviar e-mail"
                loading={isSending}
                className="mt-2"
              />

              <div className="text-center text-sm text-white">
                <Link to="/login" className="font-regular text-white">
                  Voltar ao login
                </Link>
              </div>

              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
