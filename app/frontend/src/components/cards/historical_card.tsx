import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HistoricalCardProps {
  type: 'income' | 'expense';
  title: string;
  category: string;
  amount: string;
  onClick?: () => void;
}

const iconByType = {
  income: <ArrowUpRight className="h-4 w-4 text-success" />,
  expense: <ArrowDownRight className="h-4 w-4 text-danger" />,
};

const textColorByType = {
  income: 'text-success',
  expense: 'text-danger',
};

export default function HistoricalCard({ type, title, category, amount, onClick }: HistoricalCardProps) {
  const isClickable = Boolean(onClick);

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      } : undefined}
      className={`rounded-[0.5rem] border border-border bg-card p-4 ${isClickable ? 'cursor-pointer transition hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400' : ''}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3 text-sm text-white/70">
          {iconByType[type]}
          <span className="font-medium text-white truncate">{title}</span>
          <span className="truncate text-xs text-white/50">• {category}</span>
        </div>
        <p className={`text-right text-base font-semibold ${textColorByType[type]}`}>{amount}</p>
      </div>
    </div>
  );
}
