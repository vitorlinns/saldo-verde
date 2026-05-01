import type { ReactNode } from 'react';

interface AppBarBoxProps {
  children: ReactNode;
  className?: string;
}

export default function AppBarBox({ children, className = '' }: AppBarBoxProps) {
  return (
    <div className={`absolute right-0 top-full z-20 mt-3 w-[320px] rounded-xl border border-border bg-black p-4 shadow-xl shadow-black/40 ${className}`}>
      {children}
    </div>
  );
}
