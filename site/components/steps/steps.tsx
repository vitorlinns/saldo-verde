'use client';

import MapPinLineIcon from 'remixicon-react/MapPinLineIcon';
import SmartphoneLineIcon from 'remixicon-react/SmartphoneLineIcon';
import UserSmileLineIcon from 'remixicon-react/UserSmileLineIcon';

const steps = [
  {
    icon: UserSmileLineIcon,
    label: 'Mais de 15k clientes ativos'
  },
  {
    icon: SmartphoneLineIcon,
    label: 'App prático e leve'
  },
  {
    icon: MapPinLineIcon,
    label: 'Acesso de qualquer lugar'
  }
];

export default function Steps() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-start gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm shadow-slate-200/40 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center text-primary-300">
              <Icon className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}
