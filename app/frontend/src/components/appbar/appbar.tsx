import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { Bell, Eye, EyeOff, MailQuestionIcon, Menu } from 'lucide-react';
import BoxNotification from './box_notification';
import NotificationCardAppbar from './notification_card_appbar';
import AppBarBox from './box';
import ButtonDanger from '../../components/btn/button_danger';
import ButtonSubmit from '../../components/btn/button_submit';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time?: string;
  unread?: boolean;
}

interface AppBarProps {
  session: Session | null;
  onSignOut: () => Promise<void>;
  isSigningOut: boolean;
  showValues: boolean;
  onToggleValues: () => void;
  onOpenSidebar?: () => void;
}

export default function AppBar({ session, onSignOut, isSigningOut, showValues, onToggleValues, onOpenSidebar }: AppBarProps) {
  const [openMenu, setOpenMenu] = useState<'profile' | 'notifications' | 'support' | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const email = session?.user.email ?? 'Usuário';
  const profileNameCacheKey = session ? `profile-first-name:${session.user.id}` : null;
  const [persistedFirstName, setPersistedFirstName] = useState<string>(() => {
    if (!session) return '';
    const cached = window.localStorage.getItem(`profile-first-name:${session.user.id}`);
    return cached?.trim() ?? '';
  });
  const firstNameFromMetadata =
    typeof session?.user.user_metadata?.first_name === 'string'
      ? session.user.user_metadata.first_name.trim()
      : '';
  const firstName = persistedFirstName || firstNameFromMetadata || email.split('@')[0];
  const avatarUrl =
    typeof session?.user.user_metadata?.avatar_url === 'string'
      ? session.user.user_metadata.avatar_url
      : typeof session?.user.user_metadata?.picture === 'string'
      ? session.user.user_metadata.picture
      : '';
  const initials = email
    .split('@')[0]
    .split(/[._\- ]+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const notificationsCacheKey = session ? `unread-notifications:${session.user.id}` : null;
  const CACHE_TTL_MS = 30_000;

  const BACKEND_URL = '/api';

  useEffect(() => {
    if (!session) {
      setPersistedFirstName('');
      return;
    }

    if (profileNameCacheKey) {
      const cached = window.localStorage.getItem(profileNameCacheKey)?.trim() ?? '';
      if (cached && cached !== persistedFirstName) {
        setPersistedFirstName(cached);
      }
    }

    const fetchProfileName = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/profile/${session.user.id}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          setPersistedFirstName('');
          return;
        }

        const data = await response.json();
        const dbFirstName = typeof data?.profile?.first_name === 'string' ? data.profile.first_name.trim() : '';
        setPersistedFirstName(dbFirstName);
        if (profileNameCacheKey && dbFirstName) {
          window.localStorage.setItem(profileNameCacheKey, dbFirstName);
        }
      } catch (error) {
        console.error('Failed to fetch profile name', error);
        setPersistedFirstName('');
      }
    };

    void fetchProfileName();
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const readCache = () => {
      if (!notificationsCacheKey) return null;
      const raw = window.sessionStorage.getItem(notificationsCacheKey);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as { timestamp: number; items: NotificationItem[] };
        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
        return parsed.items;
      } catch {
        return null;
      }
    };

    const writeCache = (items: NotificationItem[]) => {
      if (!notificationsCacheKey) return;
      window.sessionStorage.setItem(
        notificationsCacheKey,
        JSON.stringify({ timestamp: Date.now(), items })
      );
    };

    const fetchNotifications = async (force = false) => {
      if (!force) {
        const cached = readCache();
        if (cached) {
          setNotifications(cached);
          setLoadingNotifications(false);
          return;
        }
      }

      setLoadingNotifications(true);
      try {
        const response = await fetch(`${BACKEND_URL}/notifications?unread=true&limit=4`, {
          credentials: 'include',
        });

        if (!response.ok) {
          setNotifications([]);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          writeCache(data.notifications);
        } else {
          setNotifications([]);
          writeCache([]);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    const handleNotificationRead = (event: Event) => {
      const customEvent = event as CustomEvent<{ id?: string }>;
      const notificationId = customEvent.detail?.id;

      if (notificationId) {
        setNotifications((current) => {
          const updated = current.filter((item) => item.id !== notificationId);
          writeCache(updated);
          return updated;
        });
        return;
      }

      void fetchNotifications(true);
    };

    void fetchNotifications();
    window.addEventListener('notification-read', handleNotificationRead as EventListener);

    return () => {
      window.removeEventListener('notification-read', handleNotificationRead as EventListener);
    };
  }, [session, BACKEND_URL, notificationsCacheKey]);

  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [openMenu]);

  const unreadNotifications = notifications;
  const recentNotifications = unreadNotifications;

  return (
    <div className="mt-4 mb-8 flex justify-between rounded-[0.5rem] border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        {onOpenSidebar ? (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-12 w-12 items-center justify-center rounded-[0.5rem] border border-border bg-surface text-white transition hover:bg-white/5 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}

        <p className="hidden lg:block text-2xl font-regular text-white">{`Olá, ${firstName}`}</p>
      </div>

      <div ref={menuRef} className="flex flex-1 justify-end gap-3 items-center">
        <button
          type="button"
          onClick={onToggleValues}
          className="inline-flex h-12 w-12 items-center justify-center rounded-[0.5rem] border border-border bg-surface text-white transition hover:bg-white/5"
          aria-label={showValues ? 'Ocultar valores' : 'Mostrar valores'}
        >
          {showValues ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'support' ? null : 'support'))}
            className="inline-flex h-12 w-12 items-center justify-center rounded-[0.5rem] border border-border text-lg text-white transition hover:bg-white/5"
            aria-label="Abrir suporte"
          >
            <MailQuestionIcon className="h-5 w-5" />
          </button>

          {openMenu === 'support' ? (
            <AppBarBox>
              <div className="space-y-4">
                <div>
                  <p className="text-xl font-medium text-white">Suporte</p>
                  <p className="mt-2 text-sm text-white/70">
                    Precisa de ajuda com sua conta ou assinatura? Entre em contato com nosso suporte técnico.
                  </p>
                </div>
                <ButtonSubmit
                  type="button"
                  label="Enviar email ao suporte"
                  icon={<MailQuestionIcon className="h-4 w-4" />}
                  onClick={() => {
                    window.location.href = 'mailto:suporte@saldoverde.pro';
                    setOpenMenu(null);
                  }}
                />
              </div>
            </AppBarBox>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'notifications' ? null : 'notifications'))}
            className="inline-flex h-12 w-12 items-center justify-center rounded-[0.5rem] border border-border text-lg text-white transition hover:bg-white/5"
            aria-label="Abrir notificações"
          >
            <Bell
              className="h-5 w-5"
              style={unreadNotifications.length > 0 ? { animation: 'shake 0.8s ease-in-out infinite' } : undefined}
            />
          </button>

          {openMenu === 'notifications' ? (
            <BoxNotification>
              <div className="space-y-4">
                {loadingNotifications ? (
                  <div className="rounded-[0.5rem] border border-border bg-surface p-4 text-sm text-white/70">
                    Carregando notificações...
                  </div>
                ) : unreadNotifications.length > 0 ? (
                  <div className="space-y-3">
                    {recentNotifications.map((notification) => (
                      <NotificationCardAppbar
                        key={notification.id}
                        title={notification.title}
                        unread={notification.unread}
                        onClick={() => {
                          navigate('/notificacoes');
                          setOpenMenu(null);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[0.5rem] border border-border bg-surface p-4 text-sm text-white/70">
                    Nenhuma notificação disponível.
                  </div>
                )}

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
            </BoxNotification>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((current) => (current === 'profile' ? null : 'profile'))}
            className="inline-flex h-12 w-12 items-center justify-center rounded-[0.5rem] border border-border text-lg font-semibold text-white transition hover:bg-white/5 overflow-hidden"
            aria-label="Abrir menu de perfil"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={firstName} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
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
