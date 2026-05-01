import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login/login';
import RegisterPage from './pages/login/register';
import RecoverPage from './pages/login/recover';
import CodePage from './pages/login/code';
import PasswordPage from './pages/login/password';
import DashboardPage from './pages/dashboard/dash';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/criar-conta" element={<RegisterPage />} />
        <Route path="/recuperar-conta" element={<RecoverPage />} />
        <Route path="/recuperar-conta/codigo" element={<CodePage />} />
        <Route path="/recuperar-conta/nova-senha" element={<PasswordPage />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
