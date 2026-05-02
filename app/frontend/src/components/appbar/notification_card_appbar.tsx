interface NotificationCardAppbarProps {
  title: string;
  unread?: boolean;
  onClick: () => void;
}

export default function NotificationCardAppbar({ title, unread = false, onClick }: NotificationCardAppbarProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-white/20 ${
        unread ? 'border-primary-500 bg-white/5' : 'border-border bg-black/90'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl">
          <img src="/assets/brand/favicon.png" alt="Saldo Verde" className="h-6 w-6 object-contain" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{title}</p>
        </div>
      </div>
    </button>
  );
}
