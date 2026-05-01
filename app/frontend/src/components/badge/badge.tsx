interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  success: 'bg-success_bg text-success border-success',
  warning: 'bg-warning_bg text-warning border-warning',
  danger: 'bg-danger_bg text-danger border-danger',
  neutral: 'bg-white/5 text-white border-white/10',
};

export default function Badge({ label, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-xl border px-6 py-2 text-sm font-regular ${variantStyles[variant]} ${className}`}>
      {label}
    </span>
  );
}
