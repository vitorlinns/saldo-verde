import type { ButtonHTMLAttributes, ReactNode } from 'react';
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon';

type ButtonCtaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

export default function ButtonCta({
  children = 'Começar agora',
  className = '',
  ...props
}: ButtonCtaProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-3 rounded-full bg-primary-300 px-6 py-3 text-base font-semibold text-black transition hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <ArrowRightSLineIcon className="h-5 w-5 text-black" />
    </button>
  );
}
