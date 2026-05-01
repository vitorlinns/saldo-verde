import CheckLineIcon from 'remixicon-react/CheckLineIcon';

interface SuccessMessageProps {
  children?: string | null;
  className?: string;
}

export default function SuccessMessage({ children, className = '' }: SuccessMessageProps) {
  if (!children) return null;

  return (
    <div className={`rounded-xl border border-primary-700/60 bg-primary-950/40 px-4 py-3 text-sm text-primary-200 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary-500/10 text-primary-300">
          <CheckLineIcon className="h-4 w-4" />
        </span>
        <span>{children}</span>
      </div>
    </div>
  );
}
