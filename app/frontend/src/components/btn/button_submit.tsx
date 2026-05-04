import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { User } from 'lucide-react';

interface ButtonSubmitProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export default function ButtonSubmit({
  label,
  icon,
  loading = false,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: ButtonSubmitProps) {
  return (
    <button
      className={`${fullWidth ? 'w-full' : 'w-auto'} flex h-11 items-center justify-center rounded-[0.5rem] bg-gray px-6 py-2 text-sm font-semibold border border-border text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2 leading-none">
        {!loading && (icon ?? <User className="h-4 w-4" />)}
        {loading ? 'Carregando...' : label}
      </span>
    </button>
  );
}
