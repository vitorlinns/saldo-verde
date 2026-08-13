import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = '',
  ...props
}: InputProps) {
  return (
    <input
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-200 focus:shadow-none ${className}`}
      {...props}
    />
  );
}
