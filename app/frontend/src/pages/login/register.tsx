import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete } from '../../lib/auth';
import { API_BASE_URL } from '../../config';
import ButtonGeneral from '../../components/btn/button_general';
import AuthSidePanel from '../../components/login/auth-side-panel';
import InputGeneral from '../../components/inputs/input_general';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';
import type { Session } from '@supabase/supabase-js';

const BACKEND_URL = '/api';
const FOOTER_URL = `${BACKEND_URL}/footer-text`;
const REGISTER_URL = `${BACKEND_URL}/register`;

const validateCpf = (value: string) => {
  const cpf = value.replace(/\D/g, '');
  return cpf.length === 11;
};

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

const formatBirthdate = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

const parseBirthdateText = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (!day || !month || !year) return null;

  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) return null;
  if (birthDate.getDate() !== day || birthDate.getMonth() !== month - 1 || birthDate.getFullYear() !== year) {
    return null;
  }

  return birthDate;
};

const isAdult = (value: string) => {
  const birthDate = parseBirthdateText(value);
  if (!birthDate) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 18;
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [footerText, setFooterText] = useState('© 2026 Saldo Verde. Todos os direitos reservados.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchFooterText = async () => {
      try {
        const response = await fetch(FOOTER_URL);
        if (!response.ok) {
          throw new Error(`Footer request failed with status ${response.status}`);
        }
        const data = await response.json();
        setFooterText(data.copyright ?? footerText);
      } catch (err) {
        console.error('Failed to load footer text:', err);
      }
    };

    fetchFooterText();
  }, []);

  const handleRegister = async () => {
    if (!email.trim() || !cpf.trim() || !birthdate.trim() || !password || !confirmPassword) {
      setError('Preencha todos os campos para continuar.');
      setMessage('');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um email válido.');
      setMessage('');
      return;
    }

    if (!validateCpf(cpf)) {
      setError('Informe um CPF válido com 11 dígitos.');
      setMessage('');
      return;
    }

    if (!isAdult(birthdate)) {
      setError('É necessário ter 18 anos ou mais para se cadastrar.');
      setMessage('');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.');
      setMessage('');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      setMessage('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          cpf,
          birthdate,
        }),
      });

      const rawBody = await response.text();
      let result: Record<string, any> = {};
      if (rawBody) {
        try {
          result = JSON.parse(rawBody);
        } catch {
          result = { error: rawBody.slice(0, 180) };
        }
      }

      if (!response.ok) {
        const statusMessage = `Falha no cadastro (${response.status}).`;
        setError(result.error || statusMessage);
      } else if (result.session) {
        // Auto-login: set session and redirect to profile setup
        const supabase = createClient();
        const { error: setSessionError } = await supabase.auth.setSession(result.session as Session);
        if (setSessionError) {
          setMessage('Conta criada! Faça login para continuar.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setMessage('Conta criada com sucesso! Redirecionando...');
          const destination = '/dashboard';
          setTimeout(() => navigate(destination, { replace: true }), 1500);
        }
      } else {
        setMessage(result.message || 'Conta criada com sucesso. Faça login para continuar.');
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Ocorreu um erro ao criar a conta. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
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

              <h2 className="text-3xl font-regular tracking-tight text-white sm:text-3xl">
                Crie sua conta
              </h2>
              <p className="mt-2 text-regurlar text-white/70">
                  Atente-se ao digitar e-mail e cpf, não será possível alterá-los depois.
                </p>
           
            </div>

            <div className="space-y-3">

              <InputGeneral
                id="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Email"
                className="mt-0"
                maxLength={45}
                autoComplete="email"
              />

              <InputGeneral
                id="cpf"
                type="text"
                value={cpf}
                onChange={(value) => setCpf(formatCpf(value))}
                placeholder="CPF"
                className="mt-0"
                maxLength={14}
                inputMode="numeric"
              />

              <InputGeneral
                id="birthdate"
                type="text"
                value={birthdate}
                onChange={(value) => setBirthdate(formatBirthdate(value))}
                placeholder="Data de nascimento"
                className="mt-0"
                maxLength={10}
                inputMode="numeric"
              />

              <InputGeneral
                id="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Criar senha"
                className="mt-0"
                maxLength={20}
                autoComplete="new-password"
              />

              <InputGeneral
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirmar senha"
                className="mt-0"
                maxLength={20}
                autoComplete="new-password"
              />

              <div className="text-center text-xs leading-relaxed text-white/70">
                Ao continuar você concorda com nossas{' '}
                <a href="https://saldoverde.pro/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-300 hover:text-primary-400">
                  políticas
                </a>{' '}
                e{' '}
                <a href="https://saldoverde.pro/termos-de-uso" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-300 hover:text-primary-400">
                  termos
                </a>.
              </div>

              <div className="space-y-3">
                <ButtonGeneral
                  type="button"
                  onClick={handleRegister}
                  label="Criar conta"
                  loading={isSubmitting}
                  className="my-4"
                />
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white">
                <span>Já possui conta?</span>
                <Link to="/login" className="font-semibold text-primary-300 transition hover:text-primary-400">
                  Entrar
                </Link>
              </div>

              {message ? <SuccessMessage>{message}</SuccessMessage> : null}
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="w-full bg-black border-t border-border px-6 py-4">
        <div className="mx-auto w-full max-w-md text-center text-sm text-gray">
          {footerText}
        </div>
      </div>
    </main>
  );
}
