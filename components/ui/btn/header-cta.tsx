import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes
} from 'react';
import ArrowRightSLineIcon from 'remixicon-react/ArrowRightSLineIcon';

type HeaderCtaProps = {
  href?: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>;

export default function HeaderCta({ href, className = '', ...props }: HeaderCtaProps) {
  const classNameValue = `inline-flex items-center gap-2 rounded-full bg-primary-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-primary-400 focus:outline-none focus:ring-0 ${className}`;

  if (href) {
    return (
      <a href={href} className={classNameValue} {...props}>
        Começar agora
        <ArrowRightSLineIcon className="h-4 w-4 text-black" />
      </a>
    );
  }

  return (
    <button type="button" className={classNameValue} {...props}>
      Começar agora
      <ArrowRightSLineIcon className="h-4 w-4 text-black" />
    </button>
  );
}
