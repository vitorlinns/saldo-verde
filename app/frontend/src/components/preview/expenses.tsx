import { ArrowDownRight, AlertCircle, Pencil } from 'lucide-react';

interface ExpensesPreviewProps {
  title: string;
  amount: string;
  category: string;
  note: string;
}

export default function ExpensesPreview({ title, amount, category, note }: ExpensesPreviewProps) {
  const rawTitle = title.trim() || 'Título da despesa';
  const displayTitle = rawTitle.length > 0 ? `${rawTitle.charAt(0).toUpperCase()}${rawTitle.slice(1)}` : rawTitle;
  const displayAmount = amount.trim() ? `R$ ${Number(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';
  const displayCategory = category || 'Outros';
  const rawNote = note.trim();
  const displayNote = rawNote.length > 0 ? `${rawNote.charAt(0).toUpperCase()}${rawNote.slice(1)}` : rawNote;

  return (
    <div className="rounded-2xl border border-border bg-black/90 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <ArrowDownRight className="h-4 w-4 text-danger" />
            <span>Saída</span>
          </div>
          <p className="mt-2 text-base font-medium text-white">{displayTitle}</p>
          <p className="mt-2 text-sm text-white/70">{displayCategory}</p>
          {displayNote ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-white/70">
              <Pencil className="h-4 w-4 text-gray" />
              {displayNote}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-base font-semibold text-danger">{displayAmount}</p>
          <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
            <p>Hoje</p>
          </div>
        </div>
      </div>
    </div>
  );
}
