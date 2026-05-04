import type { ReactNode } from 'react';

interface BoxNotificationProps {
  children: ReactNode;
  className?: string;
}

export default function BoxNotification({ children, className = '' }: BoxNotificationProps) {
  return (
    <div
      className={`fixed right-4 top-[6.5rem] z-50 w-[min(90vw,320px)] rounded-[0.5rem] border border-border bg-surface p-4 shadow-xl shadow-black/40 ${className}`}
    >
      {children}
    </div>
  );
}
