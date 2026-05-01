import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CardRecordsProps {
  type: 'income' | 'expense';
  title: string;
  subtitle: string;
  amount: string;
  date: string;
  time: string;
}

const iconByType = {
  income: <ArrowUpRight className="h-4 w-4 text-success" />,
  expense: <ArrowDownRight className="h-4 w-4 text-danger" />,
};

const textColorByType = {
  income: 'text-success',
  expense: 'text-danger',
};

export default function CardRecords({
  type,
  title,
  subtitle,
  amount,
  date,
  time,
}: CardRecordsProps) {
  return (
    <div className="rounded-2xl border border-border bg-black/90 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            {iconByType[type]}
            <span>{type === 'income' ? 'Entrada' : 'Saída'}</span>
          </div>
          <p className="mt-3 text-base font-medium text-white">{title}</p>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className={`text-base font-semibold ${textColorByType[type]}`}>{amount}</p>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">
            <p>{date}</p>
            <p>{time}h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
