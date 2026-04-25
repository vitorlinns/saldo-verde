'use client';

import StarFillIcon from 'remixicon-react/StarFillIcon';

const steps = [
  {
    icon: StarFillIcon,
    label: 'Aprovado por mais de 15k Brasileiros'
  }
];

export default function Steps() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-1">
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-primary-300" />
            <p className="text-sm font-semibold text-slate-900">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}
