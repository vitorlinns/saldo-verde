import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import DownloadLineIcon from 'remixicon-react/DownloadLineIcon';

type HeaderDownloadProps = {
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>;

export default function HeaderDownload({ href, className = '', ...props }: HeaderDownloadProps) {
  const baseClass = `inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-0 ${className}`;

  if (href) {
    return (
      <a href={href} className={baseClass} {...props}>
        <DownloadLineIcon className="h-4 w-4 text-primary-700" />
        Baixar App
      </a>
    );
  }

  return (
    <button type="button" className={baseClass} {...props}>
      <DownloadLineIcon className="h-4 w-4 text-primary-700" />
      Baixar App
    </button>
  );
}
