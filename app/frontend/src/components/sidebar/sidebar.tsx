import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowUpRight, ArrowDownRight, ArrowDownUp, FileText, User, Wrench, Bell, X, TrendingUp, TrendingDown } from 'lucide-react';

const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Entradas', to: '/entrada', icon: TrendingUp },
    { label: 'Saídas', to: '/saida', icon: TrendingDown },
    { label: 'Todos os registros', to: '/registros', icon: ArrowDownUp },
    { label: 'Relatório', to: '/relatorios', icon: FileText },
    { label: 'Notificações', to: '/notificacoes', icon: Bell },
    { label: 'Meu perfil', to: '/perfil', icon: User },
    { label: 'Assinatura', to: '/assinatura', icon: FileText },
    { label: 'Configurações', to: '/configuracoes', icon: Wrench },
  ];
interface SidebarProps {
  email?: string | null;
  disableProtectedLinks?: boolean;
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ email, disableProtectedLinks = false, open = false, onClose }: SidebarProps) {
  const navContent = (
    <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1 sidebar-scroll">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isLocked =
            disableProtectedLinks &&
            item.to !== '/perfil' &&
            item.to !== '/configuracoes' &&
            item.to !== '/notificacoes' &&
            item.to !== '/assinatura';
          const itemContent = (
            <div className="flex items-center gap-3">
              {Icon ? <Icon className="h-4 w-4 text-white/40" /> : null}
              <span>{item.label}</span>
            </div>
          );

          if (isLocked) {
            return (
              <div
                key={item.to}
                className="rounded-[0.5rem] border border-border bg-black/90 px-4 py-3 text-sm font-medium text-white opacity-50 cursor-not-allowed"
                aria-disabled="true"
              >
                {itemContent}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-[0.5rem] border border-border px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-tab_sidebar text-white' : 'bg-surface text-white hover:bg-white/5'
                }`
              }
            >
              {itemContent}
            </NavLink>
          );
        })}
      </nav>
  );

  return (
    <>
      <aside className="hidden xl:sticky xl:top-0 xl:h-screen xl:min-w-[260px] xl:flex xl:flex-col xl:gap-6 xl:overflow-hidden xl:border-r xl:border-border xl:bg-bg_saas xl:p-6">
        <div className="flex items-center gap-3">
          <img src="/assets/brand/isologo.webp" alt="Saldo Verde" className="h-12 w-auto" />
        </div>
        <div className="-mx-6 h-px bg-border" />
        {navContent}
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 xl:hidden ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[320px] flex-col gap-6 overflow-hidden border-r border-border bg-bg_saas p-6 transition-transform duration-300 xl:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/brand/isologo.webp" alt="Saldo Verde" className="h-12 w-auto" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[0.5rem] border border-border text-white transition hover:bg-white/5"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="-mx-6 h-px bg-border" />
        {navContent}
      </aside>
    </>
  );
}
