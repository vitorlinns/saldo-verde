import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowUpRight, ArrowDownRight, Archive, ArrowDownUp, FileText } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Entradas', to: '/entrada', icon: ArrowUpRight },
  { label: 'Saídas', to: '/saida', icon: ArrowDownRight },
  { label: 'Todos os registros', to: '/registros', icon: ArrowDownUp },
  { label: 'Relatório', to: '/relatorios', icon: FileText },
  { label: 'Transações', to: '/home/transacoes' },
  { label: 'Planejamento', to: '/home/planejamento' },
  { label: 'Configurações', to: '/home/configuracoes' },
];

interface SidebarProps {
  email?: string | null;
}

export default function Sidebar({ email }: SidebarProps) {
  return (
    <aside className="hidden xl:flex xl:h-full xl:min-h-screen xl:min-w-[260px] xl:flex-col xl:gap-6 xl:overflow-hidden xl:border xl:border-border xl:bg-black/80 xl:p-6 xl:shadow-xl xl:shadow-black/20">
      <div className="flex items-center gap-3">
        <img src="/assets/brand/isologo.png" alt="Saldo Verde" className="h-12 w-auto" />
      </div>
      <div className="h-px bg-border" />

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;

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
              <div className="flex items-center gap-3">
                {Icon ? <Icon className="h-4 w-4 text-white/40" /> : null}
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="rounded-lg border border-border bg-black/90 p-4 text-sm text-white/70">
        <p className="uppercase tracking-[0.2em] text-gray">Suporte</p>
        <p className="mt-3">Precisa de ajuda? Envie um email para suporte@saldoverde.pro.</p>
      </div>
    </aside>
  );
}
