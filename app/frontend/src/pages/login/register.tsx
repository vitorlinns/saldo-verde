import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBrowserSupabaseClient } from 'saldo-verde-supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import ButtonGeneral from '../../components/btn/button_general';
import InputGeneral from '../../components/inputs/input_general';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';

const createClient = (): SupabaseClient => createBrowserSupabaseClient();

const validateCpf = (value: string) => {
  const cpf = value.replace(/\D/g, '');
  return cpf.length === 11;
};

export default function RegisterPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [footerText, setFooterText] = useState('© 2026 Saldo Verde. Todos os direitos reservados.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch (err) {
      setError('Não foi possível iniciar o registro. Por favor, tente novamente.');
      console.error('RegisterPage init error:', err);
    }
  }, []);

  useEffect(() => {
    const fetchFooterText = async () => {
      try {
        const response = await fetch('/api/footer-text');
        const data = await response.json();
        setFooterText(data.copyright ?? footerText);
      } catch (err) {
        console.error('Failed to load footer text:', err);
      }
    };

    fetchFooterText();
  }, []);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !cpf.trim() || !password || !confirmPassword) {
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

    if (!supabase) {
      setError('Não foi possível iniciar o registro. Por favor, tente novamente.');
      setMessage('');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const [result] = await Promise.all([
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              cpf: cpf.replace(/\D/g, ''),
            },
          },
        }),
        delay(2000),
      ]);

      if (result.error) {
        setError(result.error.message);
      } else {
        setMessage('Conta criada com sucesso. Verifique seu email para confirmar o registro.');
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
    <main className="min-h-screen bg-black text-white">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <div className="hidden lg:block bg-primary-black" />

        <div className="flex items-center justify-center bg-black px-6 py-12">
          <div className="w-full max-w-md rounded-[2rem] border border-border bg-black/95 p-8 backdrop-blur-xl shadow-xl shadow-black/20 sm:p-10">
            <div className="mb-6 space-y-4">
              <div className="flex justify-left">
                <img src="/assets/brand/isologo.png" alt="Logo" className="h-12 w-auto" />
              </div>

              <h2 className="text-3xl font-medium tracking-tight text-white sm:text-3xl">
                Criar conta grátis
              </h2>
           
            </div>

            <div className="space-y-3">
              <InputGeneral
                id="firstName"
                type="text"
                value={firstName}
                onChange={setFirstName}
                placeholder="Primeiro nome"
                className="mt-0"
              />

              <InputGeneral
                id="lastName"
                type="text"
                value={lastName}
                onChange={setLastName}
                placeholder="Sobrenome"
                className="mt-0"
              />

              <InputGeneral
                id="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Email"
                className="mt-0"
              />

              <InputGeneral
                id="cpf"
                type="text"
                value={cpf}
                onChange={setCpf}
                placeholder="CPF"
                className="mt-0"
              />

              <InputGeneral
                id="password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Criar senha"
                className="mt-0"
              />

              <InputGeneral
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirmar senha"
                className="mt-0"
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
                <span>Já tem conta?</span>
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
