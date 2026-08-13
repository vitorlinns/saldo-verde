import type { ButtonHTMLAttributes, ReactNode } from 'react';

type NewsletterButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export default function NewsletterButton({
  children = 'Inscrever',
  className = '',
  ...props
}: NewsletterButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-2xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
