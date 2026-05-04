import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient, isProfileComplete, signOutWithBackend } from '../../lib/auth';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import Sidebar from '../../components/sidebar/sidebar';
import AppBar from '../../components/appbar/appbar';
import Footer from '../../components/footer/footer';
import ModalViewMessage from '../../components/modal/modal_view_message';
import NotificationsCard from '../../components/cards/notifications_card';

const BACKEND_URL = '/api';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  time?: string;
  unread?: boolean;
}

const formatDate = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}`;
};

const formatTime = (value: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const getDefaultNotifications = (session: Session): NotificationItem[] => {
  const now = new Date();
  const date = formatDate(now);
  const time = formatTime(now);
  const complete = isProfileComplete(session);

  const notifications: NotificationItem[] = [
    {
      id: `welcome-${session.user.id}`,
      title: 'Bem-vindo ao Saldo Verde',
      message: 'Sua conta foi criada com sucesso. Explore as funcionalidades e organize suas finanças aqui.',
      date,
      time,
      unread: true,
    },
  ];

  if (!complete) {
    notifications.push({
      id: `complete-profile-${session.user.id}`,
      title: 'Complete seu cadastro',
      message: 'Finalize seu perfil para liberar o acesso total à plataforma.',
      date,
      time,
      unread: true,
    });
  } else {
    notifications.push({
      id: `profile-complete-${session.user.id}`,
      title: 'Cadastro concluído',
      message: 'Tudo certo! Seu perfil está completo e você já pode usar a plataforma normalmente.',
      date,
      time,
      unread: true,
    });
  }

  return notifications;
};

export default function NotificationsPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const navigate = useNavigate();
  const notificationsCacheKey = session ? `unread-notifications:${session.user.id}` : null;
  const CACHE_TTL_MS = 30_000;

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
      });

      const { data: authListener } = client.auth.onAuthStateChange((_event, sessionData) => {
        const currentSession = sessionData ?? null;
        setSession(currentSession);
        if (!currentSession) {
          navigate('/login', { replace: true });
          return;
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } catch (err) {
      console.error('NotificationsPage init error:', err);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    document.title = 'Notificações | Saldo Verde';
  }, []);

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

    const fetchNotifications = async () => {
      const cached = readCache();
      if (cached) {
        setNotifications(cached);
        setLoadingNotifications(false);
        return;
      }

      setLoadingNotifications(true);
      try {
        const response = await fetch(`${BACKEND_URL}/notifications?unread=true&limit=50`, {
          headers: {
            Authorization: `Bearer ${session.access_token ?? ''}`,
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch notifications');
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
      } catch (err) {
        console.error('Notifications fetch error:', err);
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [session, notificationsCacheKey]);

  if (!session) {
    return null;
  }

  const profileComplete = isProfileComplete(session);

  const handleViewNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);
  };

  const handleCloseNotification = () => {
    setSelectedNotification(null);
  };

  const handleNotificationMarked = () => {
    if (selectedNotification) {
      window.dispatchEvent(
        new CustomEvent('notification-read', {
          detail: { id: selectedNotification.id },
        })
      );

      setNotifications((current) => {
        const updated = current.filter((notification) => notification.id !== selectedNotification.id);
        if (notificationsCacheKey) {
          window.sessionStorage.setItem(
            notificationsCacheKey,
            JSON.stringify({ timestamp: Date.now(), items: updated })
          );
        }
        return updated;
      });
    }
    setSelectedNotification(null);
  };

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
  const visibleNotifications = notifications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="min-h-screen bg-background text-white">
      <div className="min-h-screen h-full grid w-full gap-6 lg:grid-cols-[280px_1fr] lg:items-stretch">
        <Sidebar email={session.user.email ?? null} disableProtectedLinks={!isProfileComplete(session)} />

        <div className="mr-4 flex min-h-screen flex-col">
          <AppBar
            session={session}
            onSignOut={async () => {
              if (!supabase) return;
              setIsSigningOut(true);
              await signOutWithBackend(supabase);
              setIsSigningOut(false);
              navigate('/login', { replace: true });
            }}
            isSigningOut={isSigningOut}
            showValues={showValues}
            onToggleValues={() => setShowValues((current) => !current)}
          />

          <section className="flex-1 space-y-6 px-4 pb-8 sm:px-6 lg:px-0">
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-regular text-white">Notificações</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/70">
                    Veja aqui todos os avisos e atualizações importantes da sua conta.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {loadingNotifications ? (
                <div className="rounded-[0.5rem] border border-border bg-surface p-6 text-center text-sm text-white/70">
                  Carregando notificações...
                </div>
              ) : visibleNotifications.length > 0 ? (
                visibleNotifications.map((notification) => (
                  <NotificationsCard
                    key={notification.id}
                    title={notification.title}
                    message={notification.message}
                    unread={notification.unread}
                    onView={() => handleViewNotification(notification)}
                  />
                ))
              ) : (
                <div className="rounded-[0.5rem] border border-border bg-surface p-6 text-center text-sm text-white/70">
                  Nenhuma notificação encontrada.
                </div>
              )}
            </div>

            {totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                  className="rounded-[0.5rem] border border-border bg-surface px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-[0.5rem] border px-4 py-2 text-sm font-medium transition ${
                        currentPage === page
                          ? 'border-primary-500 bg-primary-500 text-black'
                          : 'border-border bg-black/90 text-white hover:bg-white/5'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border border-border bg-black/90 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            ) : null}
          </section>

          <Footer />
        </div>
      </div>

      <ModalViewMessage
        open={Boolean(selectedNotification)}
        title={selectedNotification?.title ?? 'Mensagem'}
        message={selectedNotification?.message ?? ''}
        date={selectedNotification?.date ?? ''}
        time={selectedNotification?.time}
        notificationId={selectedNotification?.id}
        accessToken={session.access_token}
        onClose={handleCloseNotification}
        onMarked={handleNotificationMarked}
      />
    </main>
  );
}
