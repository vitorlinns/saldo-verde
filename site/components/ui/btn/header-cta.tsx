import type { ButtonHTMLAttributes } from 'react';
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon';

type HeaderCtaProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function HeaderCta({ className = '', ...props }: HeaderCtaProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full bg-primary-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-400 focus:outline-none focus:ring-0 ${className}`}
      {...props}
    >
      Começar agora
      <ArrowRightSLineIcon className="h-4 w-4 text-black" />
    </button>
  );
}
