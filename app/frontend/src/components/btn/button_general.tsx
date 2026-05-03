import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Loader4LineIcon from 'remixicon-react/Loader4LineIcon';

interface ButtonGeneralProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const variants: Record<NonNullable<ButtonGeneralProps['variant']>, string> = {
  primary: 'bg-primary-300 text-black hover:bg-primary-400',
  secondary: 'bg-white/5 text-white hover:bg-white/10',
  ghost: 'bg-transparent text-white hover:bg-white/10',
};

export default function ButtonGeneral({
  label,
  icon,
  loading = false,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonGeneralProps) {
  return (
    <button
      className={`w-full rounded-[0.5rem] px-5 py-3 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? (
          <Loader4LineIcon className="h-5 w-5 animate-spin text-current" />
        ) : (
          icon
        )}
        {loading ? 'Carregando...' : label}
      </span>
    </button>
  );
}
