import ErrorWarningFillIcon from 'remixicon-react/ErrorWarningFillIcon';

interface ErrorMessageProps {
  children?: string | null;
  className?: string;
}

export default function ErrorMessage({ children, className = '' }: ErrorMessageProps) {
  if (!children) return null;

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-danger bg-danger_bg px-4 py-3 text-sm text-danger ${className}`}>
      <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-red-600/10 text-red-300">
        <ErrorWarningFillIcon size={18} color="#f87171" className="h-4 w-4" />
      </span>
      <span>{children}</span>
    </div>
  );
}
