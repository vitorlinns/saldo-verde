import type { ComponentType } from 'react';
import MedalLineIcon from 'remixicon-react/MedalLineIcon';

type BadgeProps = {
  text?: string;
  Icon?: ComponentType<any>;
  className?: string;
};

export default function Badge({
  text = 'N° 1 em organização financeira no Brasil',
  Icon = MedalLineIcon,
  className = '',
}: BadgeProps) {
  return (
    <div className={`inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-primary-900 ${className}`}>
      <Icon className="h-4 w-4" />
      {text}
    </div>
  );
}
