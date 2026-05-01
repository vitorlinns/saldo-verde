import { ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';

interface FinanceWidgetProps {
  title: string;
  value: number;
  description: string;
  variant?: 'primary' | 'success' | 'danger';
  showValues?: boolean;
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function FinanceWidget({
  title,
  value,
  description,
  variant = 'primary',
  showValues = true,
}: FinanceWidgetProps) {
  const variantStyles = {
    primary: 'border-border bg-black text-white',
    success: 'border-success/50 bg-success_bg text-success',
    danger: 'border-danger/50 bg-danger_bg text-danger',
  };

  const titleIcon =
    variant === 'success' ? (
      <ArrowUpRight className="h-4 w-4 text-success" />
    ) : variant === 'danger' ? (
      <ArrowDownRight className="h-4 w-4 text-danger" />
    ) : (
      <DollarSign className="h-4 w-4 text-white" />
    );

  return (
    <div className={`rounded-xl border p-6 shadow-xl shadow-black/20 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 text-sm text-white">
        {titleIcon}
        <span>{title}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold">
        {showValues ? currencyFormatter.format(value) : '•••••••'}
      </p>
      <p className="mt-2 text-sm text-white">{description}</p>
    </div>
  );
}
