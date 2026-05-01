import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LogOut } from 'lucide-react';

interface ButtonDangerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  loading?: boolean;
}

export default function ButtonDanger({
  label,
  icon,
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonDangerProps) {
  return (
    <button
      className={`w-full flex h-10 items-center justify-center rounded-xl border border-danger bg-danger_bg px-4 text-sm font-semibold text-danger transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2 leading-none">
        {loading ? (
          'Saindo...'
        ) : (
          <>
            {icon ?? <LogOut className="h-4 w-4" />}
            {label}
          </>
        )}
      </span>
    </button>
  );
}
