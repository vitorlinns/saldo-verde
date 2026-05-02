import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
        <Route path="/entrada" element={<EntrancePage />} />
        <Route path="/saida" element={<ExpensesPage />} />
        <Route path="/registros" element={<AllRecordsPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
