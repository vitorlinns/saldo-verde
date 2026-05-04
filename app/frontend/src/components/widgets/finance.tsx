import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';

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
    primary: 'border-border bg-surface text-white',
    success: 'border-border bg-surface text-success',
    danger: 'border-border bg-surface text-danger',
  };

  const titleIcon =
    variant === 'success' ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : variant === 'danger' ? (
      <TrendingDown className="h-4 w-4 text-danger" />
    ) : (
      <DollarSign className="h-4 w-4 text-white" />
    );

  return (
    <div className={`rounded-[0.5rem] border p-6 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 text-sm text-white">
        {titleIcon}
        <span>{title}</span>
      </div>
      <p className="mt-4 text-3xl font-regular">
        {showValues ? currencyFormatter.format(value) : '•••••••'}
      </p>
      <p className="mt-2 text-sm text-white">{description}</p>
    </div>
  );
}
