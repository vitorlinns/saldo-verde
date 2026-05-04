import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ButtonGeneral from '../../components/btn/button_general';
import AuthSidePanel from '../../components/login/auth-side-panel';
import ErrorMessage from '../../components/message/error';
import SuccessMessage from '../../components/message/success';
import InputGeneral from '../../components/inputs/input_general';
import { safeParseJson } from '../../lib/http';

const BACKEND_URL = '/api';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('recoverEmail');
    const recoverVerified = sessionStorage.getItem('recoverVerified');
    const storedCode = sessionStorage.getItem('recoverCode');

    if (!storedEmail || recoverVerified !== 'true' || !storedCode) {
      navigate('/recuperar-conta', { replace: true });
      return;
    }

    setEmail(storedEmail);
    setCode(storedCode);
  }, [navigate]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSave = async () => {
    if (!password || !confirmPassword) {
      setError('Preencha os dois campos de senha.');
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

    if (!email || !code) {
      setError('Dados de recuperação ausentes. Reinicie o fluxo de recuperação.');
      setMessage('');
      return;
    }

    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const response = await fetch(`${BACKEND_URL}/recover/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          password,
        }),
      });

      const data = await safeParseJson<{ message?: string; error?: string }>(response);
      if (!response.ok) {
        setError(
          typeof data === 'object' && 'error' in data
            ? data.error || 'Não foi possível redefinir a senha.'
            : 'Não foi possível redefinir a senha.'
        );
      } else {
        setMessage('Senha redefinida com sucesso. Redirecionando para o login...');
        sessionStorage.removeItem('recoverEmail');
        sessionStorage.removeItem('recoverCode');
        sessionStorage.removeItem('recoverVerified');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Ocorreu um erro ao redefinir a senha. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <AuthSidePanel />

        <div className="flex items-center justify-center bg-black px-6 py-12">
          <div className="w-full max-w-md rounded-[1rem] border border-border bg-surface p-8 sm:p-10">
            <div className="mb-6 space-y-4">
              <div className="flex justify-left">
                <img src="/assets/brand/isologo.webp" alt="Logo" className="h-12 w-auto" />
              </div>

              <div>
                <h2 className="text-3xl font-regular tracking-tight text-white sm:text-3xl">
                  Criar nova senha
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Digite e confirme sua nova senha para finalizar a recuperação de conta.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <InputGeneral
                id="new-password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Nova senha"
                className="mt-0"
                maxLength={20}
              />

              <InputGeneral
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Confirmar senha"
                className="mt-0"
                maxLength={20}
              />

              <ButtonGeneral
                type="button"
                onClick={handleSave}
                label="Salvar nova senha"
                loading={isSaving}
                className="mt-2"
              />


              {message ? <SuccessMessage>{message}</SuccessMessage> : null}
              {error ? <ErrorMessage>{error}</ErrorMessage> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
