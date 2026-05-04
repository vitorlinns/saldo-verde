import type { ReactNode } from 'react';

interface AppBarBoxProps {
  children: ReactNode;
  className?: string;
}

export default function AppBarBox({ children, className = '' }: AppBarBoxProps) {
  return (
    <div className={`absolute right-0 top-full z-20 mt-6 w-[280px] rounded-[0.5rem] border border-border bg-surface p-4 shadow-xl shadow-black/40 ${className}`}>
      {children}
    </div>
  );
}
