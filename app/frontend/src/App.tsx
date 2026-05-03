import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/login/login';
import RegisterPage from './pages/login/register';
import RecoverPage from './pages/login/recover';
import CodePage from './pages/login/code';
import PasswordPage from './pages/login/password';
import DashboardPage from './pages/dashboard/dash';
import EntrancePage from './pages/records/entrance';
import ExpensesPage from './pages/records/expenses';
import AllRecordsPage from './pages/records/all_records';
import ReportsPage from './pages/reports/reports';
import NotificationsPage from './pages/notifications/notifications';
import ProfilePage from './pages/profile/profile';
import ConfigPage from './pages/config/config';
import SubscriptionPage from './pages/subscription/subscription';
import Preloader from './components/preloader/preloader';
import { SessionProvider } from './contexts/session-context';

const AUTH_ROUTES = ['/login', '/criar-conta', '/recuperar-conta'] as const;

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(() => !isAuthRoute(location.pathname));
  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    const showPreloader = !isAuthRoute(location.pathname);

    if (!showPreloader) {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }

    timeoutId.current = window.setTimeout(() => {
      setLoading(false);
      timeoutId.current = null;
    }, 280);

    return () => {
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    };
  }, [location.pathname]);

  return (
    <>
      <Preloader visible={loading} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-conta" element={<RegisterPage />} />
        <Route path="/recuperar-conta" element={<RecoverPage />} />
        <Route path="/recuperar-conta/codigo" element={<CodePage />} />
        <Route path="/recuperar-conta/nova-senha" element={<PasswordPage />} />
        <Route
          path="/home"
          element={
            <SessionProvider>
              <Navigate to="/dashboard" replace />
            </SessionProvider>
          }
        />
        <Route
          path="/dashboard"
          element={
            <SessionProvider>
              <DashboardPage />
            </SessionProvider>
          }
        />
        <Route
          path="/entrada"
          element={
            <SessionProvider>
              <EntrancePage />
            </SessionProvider>
          }
        />
        <Route
          path="/saida"
          element={
            <SessionProvider>
              <ExpensesPage />
            </SessionProvider>
          }
        />
        <Route
          path="/perfil"
          element={
            <SessionProvider>
              <ProfilePage />
            </SessionProvider>
          }
        />
        <Route
          path="/assinatura"
          element={
            <SessionProvider>
              <SubscriptionPage />
            </SessionProvider>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <SessionProvider>
              <ConfigPage />
            </SessionProvider>
          }
        />
        <Route
          path="/registros"
          element={
            <SessionProvider>
              <AllRecordsPage />
            </SessionProvider>
          }
        />
        <Route
          path="/relatorios"
          element={
            <SessionProvider>
              <ReportsPage />
            </SessionProvider>
          }
        />
        <Route
          path="/notificacoes"
          element={
            <SessionProvider>
              <NotificationsPage />
            </SessionProvider>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
