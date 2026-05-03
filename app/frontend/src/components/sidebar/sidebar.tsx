import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowUpRight, ArrowDownRight, ArrowDownUp, FileText, User, Wrench, Bell } from 'lucide-react';

const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Entradas', to: '/entrada', icon: ArrowUpRight },
    { label: 'Saídas', to: '/saida', icon: ArrowDownRight },
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
}

export default function Sidebar({ email, disableProtectedLinks = false }: SidebarProps) {
  return (
    <aside className="hidden xl:sticky xl:top-0 xl:h-screen xl:min-w-[260px] xl:flex xl:flex-col xl:gap-6 xl:overflow-hidden xl:border xl:border-border xl:bg-black/80 xl:p-6 xl:shadow-xl xl:shadow-black/20">
      <div className="flex items-center gap-3">
        <img src="/assets/brand/isologo.webp" alt="Saldo Verde" className="h-12 w-auto" />
      </div>
      <div className="h-px bg-border" />

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1 sidebar-scroll">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isLocked = disableProtectedLinks && item.to !== '/perfil' && item.to !== '/configuracoes' && item.to !== '/notificacoes' && item.to !== '/assinatura';
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
                className="rounded-xl border border-border bg-black/90 px-4 py-3 text-sm font-medium text-white opacity-50 cursor-not-allowed"
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
                `rounded-xl border border-border px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-gray/30 text-white' : 'bg-black/90 text-white hover:bg-white/5'
                }`
              }
            >
              {itemContent}
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
}
