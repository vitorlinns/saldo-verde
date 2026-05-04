import { ArrowUpRight } from 'lucide-react';

interface EntrancePreviewProps {
  title: string;
  amount: string;
  category: string;
  note: string;
}

export default function EntrancePreview({ title, amount, category, note }: EntrancePreviewProps) {
  const rawTitle = title.trim() || 'Título da receita';
  const displayTitle = rawTitle.length > 0 ? `${rawTitle.charAt(0).toUpperCase()}${rawTitle.slice(1)}` : rawTitle;
  const displayAmount = amount.trim() ? `R$ ${Number(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';
  const displayCategory = category || 'Categoria';
  const rawNote = note.trim();
  const displayNote = rawNote.length > 0 ? `${rawNote.charAt(0).toUpperCase()}${rawNote.slice(1)}` : 'Sem detalhes.';

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <ArrowUpRight className="h-4 w-4 text-success" />
          <span>Entrada</span>
        </div>
        <p className="mt-2 text-base font-medium text-white">{displayTitle}</p>
        <p className="mt-1 text-sm font-normal text-white/60">{displayCategory}</p>
        <p className="mt-1 text-sm font-normal text-white/60">{displayNote}</p>
      </div>
      <div className="text-right">
        <p className="text-base font-semibold text-success">{displayAmount}</p>
        <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
          <p>Hoje</p>
        </div>
      </div>
    </div>
  );
}
