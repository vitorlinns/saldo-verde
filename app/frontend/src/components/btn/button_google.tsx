import type { ButtonHTMLAttributes } from 'react';
import Loader4LineIcon from 'remixicon-react/Loader4LineIcon';
import GoogleIcon from '../../public/assets/icons/google.svg';

interface ButtonGoogleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
}

export default function ButtonGoogle({ label = 'Entrar com Google', className = '', loading = false, ...props }: ButtonGoogleProps) {
  return (
    <button
      className={`flex w-full items-center justify-center gap-2 rounded-[0.5rem] border border-border bg-btn_google px-5 py-3 text-white font-medium text-black transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-70 disabled:pointer-events-none ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      <span className="inline-flex items-center justify-center gap-2">
        {loading ? <Loader4LineIcon className="h-5 w-5 animate-spin text-current" /> : <img src={GoogleIcon} alt="Google" className="h-5 w-5 block" />}
        {loading ? 'Carregando...' : label}
      </span>
    </button>
  );
}
