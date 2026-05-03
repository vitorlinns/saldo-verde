import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonGeneral from '../../components/btn/button_general';
import ErrorMessage from '../../components/message/error';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '/api';

export default function CodePage() {
  const [code, setCode] = useState(Array(6).fill(''));
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('recoverEmail');
    if (!storedEmail) {
      navigate('/recuperar-conta', { replace: true });
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (code.some((digit) => digit.length !== 1)) {
      setError('Informe os 6 dígitos do código.');
      return;
    }

    if (!email) {
      setError('Email de recuperação não encontrado.');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const response = await fetch(`${BACKEND_URL}/recover/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: code.join(''),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Código inválido ou expirado.');
      } else {
        sessionStorage.setItem('recoverCode', code.join(''));
        sessionStorage.setItem('recoverVerified', 'true');
        navigate('/recuperar-conta/nova-senha');
      }
    } catch (err) {
      console.error('Recover verify error:', err);
      setError('Ocorreu um erro ao verificar o código. Tente novamente.');
    } finally {
      setIsVerifying(false);
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
                  Código de verificação
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Digite o código de 6 dígitos enviado para o seu email.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                {code.map((value, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    value={value}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    maxLength={1}
                    inputMode="numeric"
                    className="h-14 w-12 rounded-xl border border-border bg-black px-3 text-center text-2xl text-white outline-none transition focus:border-primary-300"
                  />
                ))}
              </div>

              <ButtonGeneral
                type="button"
                onClick={handleSubmit}
                label="Verificar código"
                loading={isVerifying}
                className="w-full"
              />

            

              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
