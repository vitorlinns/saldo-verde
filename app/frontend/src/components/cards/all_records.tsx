import { TrendingUp, TrendingDown } from 'lucide-react';

interface AllRecordsCardProps {
  type: 'income' | 'expense';
  title: string;
  category: string;
  amount: string;
  date: string;
  time: string;
  note: string;
}

const iconByType = {
  income: <TrendingUp className="h-4 w-4 text-success" />,
  expense: <TrendingDown className="h-4 w-4 text-danger" />,
};

const textColorByType = {
  income: 'text-success',
  expense: 'text-danger',
};

export default function AllRecordsCard({ type, title, category, amount, date, time, note }: AllRecordsCardProps) {
  return (
    <tr className="border-b border-border last:border-b-0 bg-bg_saas">
      <td className="px-4 py-5 align-top sm:px-6 sm:py-6">
        <div className="flex items-center gap-2 text-sm text-white/70">
          {iconByType[type]}
          <span className="max-w-[80px] truncate sm:max-w-none">{type === 'income' ? 'Entrada' : 'Saída'}</span>
        </div>
      </td>
      <td className="hidden px-6 py-6 align-top overflow-hidden sm:table-cell">
        <p className="truncate text-sm font-medium text-white">{title}</p>
      </td>
      <td className="hidden px-6 py-6 align-top overflow-hidden sm:table-cell">
        <p className="truncate text-sm text-white/60">{category}</p>
      </td>
      <td className={`px-4 py-5 align-top text-sm font-semibold ${textColorByType[type]} sm:px-6 sm:py-6`}>{amount}</td>
      <td className="hidden px-6 py-6 align-top text-sm uppercase tracking-[0.12em] text-white/40 sm:table-cell">{date}</td>
      <td className="hidden px-6 py-6 align-top text-sm uppercase tracking-[0.12em] text-white/40 sm:table-cell">{time}</td>
      <td className="hidden px-6 py-6 align-top overflow-hidden sm:table-cell">
        <p className="truncate text-sm text-white/70">{note || '—'}</p>
      </td>
    </tr>
  );
}
