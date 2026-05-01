import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { Bell, ClipboardList, Eye, EyeOff } from 'lucide-react';
import AppBarBox from './box';
import ButtonDanger from '../../components/btn/button_danger';
import ButtonSubmit from '../../components/btn/button_submit';

interface AppBarProps {
  session: Session | null;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  showValues: boolean;
  onToggleValues: () => void;
}

export default function AppBar({ session, onSignOut, isSigningOut, showValues, onToggleValues }: AppBarProps) {
  const [openMenu, setOpenMenu] = useState<'profile' | 'notifications' | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const email = session?.user.email ?? 'Usuário';
  const firstName =
    typeof session?.user.user_metadata?.first_name === 'string'
      ? session.user.user_metadata.first_name
      : email.split('@')[0];
  const initials = email
    .split('@')[0]
    .split(/[._\- ]+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [openMenu]);

  return (
    <div className="mt-4 mb-8 flex justify-between rounded-xl border border-border bg-black p-3 shadow-xl shadow-black/20">
      <div className="flex items-center gap-4">
        <p className="text-2xl font-semibold text-white">{`Olá, ${firstName}`}</p>
        <button
          type="button"
          onClick={onToggleValues}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-black/90 px-4 text-sm text-white transition hover:bg-white/5"
        >
          {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showValues ? 'Ocultar valores' : 'Mostrar valores'}
        </button>
      </div>

      <div ref={menuRef} className="flex w-full justify-end gap-3 sm:w-auto">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'notifications' ? null : 'notifications'))}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-black/90 text-lg text-white shadow-black/10 transition hover:bg-white/5"
            aria-label="Abrir notificações"
          >
            <Bell
              className="h-5 w-5"
              style={{ animation: 'shake 0.8s ease-in-out infinite' }}
            />
          </button>

          {openMenu === 'notifications' ? (
            <AppBarBox>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="rounded-xl border border-border bg-black/90 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-primary-300">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Finalize seu cadastro</p>
                      <p className="mt-2 text-xs text-white/70">Complete suas informações para começar a usar o sistema.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-black/90 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-primary-300">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Sua fatura irá vencer em 3 dias</p>
                      <p className="mt-2 text-xs text-white/70">Verifique seus lançamentos e evite juros.</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-black/90 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-primary-300">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Atualização do plano</p>
                      <p className="mt-2 text-xs text-white/70">Seu admin adicionou novas regras de faturamento.</p>
                    </div>
                  </div>
                </div>
                </div>
                <ButtonSubmit
                  type="button"
                  label="Ver todas notificações"
                  onClick={() => {
                    navigate('/notificacoes');
                    setOpenMenu(null);
                  }}
                  icon={<Bell className="h-4 w-4" />}
                />
              </div>
            </AppBarBox>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'profile' ? null : 'profile'))}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-black/90 text-lg font-semibold text-white shadow-black/10 transition hover:bg-white/5"
            aria-label="Abrir menu de perfil"
          >
            {initials}
          </button>

          {openMenu === 'profile' ? (
            <AppBarBox>
              <div className="space-y-3">
                <ButtonSubmit
                  type="button"
                  label="Ver perfil"
                  onClick={() => {
                    navigate('/perfil');
                    setOpenMenu(null);
                  }}
                />
                <ButtonDanger
                  type="button"
                  label="Sair"
                  onClick={onSignOut}
                  loading={isSigningOut}
                  disabled={isSigningOut}
                />
              </div>
            </AppBarBox>
          ) : null}
        </div>
      </div>
    </div>
  );
}
