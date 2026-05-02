import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  income: <ArrowUpRight className="h-4 w-4 text-success" />,
  expense: <ArrowDownRight className="h-4 w-4 text-danger" />,
};

const textColorByType = {
  income: 'text-success',
  expense: 'text-danger',
};

export default function AllRecordsCard({ type, title, category, amount, date, time, note }: AllRecordsCardProps) {
  return (
    <tr className="border-b border-white/10 last:border-b-0 bg-black/90">
      <td className="px-6 py-6 align-top">
        <div className="flex items-center gap-2 text-sm text-white/70">
          {iconByType[type]}
          <span>{type === 'income' ? 'Entrada' : 'Saída'}</span>
        </div>
      </td>
      <td className="px-6 py-6 align-top overflow-hidden">
        <p className="truncate text-sm font-medium text-white">{title}</p>
      </td>
      <td className="px-6 py-6 align-top overflow-hidden">
        <p className="truncate text-sm text-white/60">{category}</p>
      </td>
      <td className={`px-6 py-6 align-top text-sm font-semibold ${textColorByType[type]}`}>{amount}</td>
      <td className="px-6 py-6 align-top text-sm uppercase tracking-[0.12em] text-white/40">{date}</td>
      <td className="px-6 py-6 align-top text-sm uppercase tracking-[0.12em] text-white/40">{time}</td>
      <td className="px-6 py-6 align-top overflow-hidden">
        <p className="truncate text-sm text-white/70">{note || '—'}</p>
      </td>
    </tr>
  );
}
