import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonGeneral from '../../components/btn/button_general';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';
import InputGeneral from '../../components/inputs/input_general';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4001';

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

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível enviar o email de recuperação.');
      } else {
        sessionStorage.setItem('recoverEmail', email.trim().toLowerCase());
        setMessage(data.message || 'Se o email existir, você receberá instruções de recuperação.');
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
    <main className="min-h-screen bg-black text-white">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <div className="hidden lg:block bg-primary-black" />

        <div className="flex items-center justify-center bg-black px-6 py-12">
          <div className="w-full max-w-md rounded-[2rem] border border-border bg-black/95 p-8 backdrop-blur-xl shadow-xl shadow-black/20 sm:p-10">
            <div className="mb-6 space-y-4">
              <div className="flex justify-left">
                <img src="/assets/brand/isologo.png" alt="Logo" className="h-12 w-auto" />
              </div>

              <div>
                <h2 className="text-3xl font-medium tracking-tight text-white sm:text-3xl">
                  Recuperar conta
                </h2>
                <p className="mt-2 text-sm text-white/70">
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
                placeholder="Email"
                className="mt-0"
              />

              <ButtonGeneral
                type="button"
                onClick={handleRecover}
                label="Enviar código"
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
