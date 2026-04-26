'use client';

import { useEffect, useRef, useState } from 'react';
import Badge from '../../../components/ui/badge/badge';
import ButtonCta from '../../../components/ui/btn/button-cta';
import BarChart2LineIcon from 'remixicon-react/BarChart2LineIcon';
import BarChartBoxLineIcon from 'remixicon-react/BarChartBoxLineIcon';
import ClipboardLineIcon from 'remixicon-react/ClipboardLineIcon';
import ChatHeartLineIcon from 'remixicon-react/ChatHeartLineIcon';

const startSteps = [
  {
    icon: ClipboardLineIcon,
    title: 'Crie sua conta',
    description: 'Cadastre-se rapidamente e comece a organizar suas finanças em minutos.'
  },
  {
    icon: BarChartBoxLineIcon,
    title: 'Importe ou registre suas despesas',
    description: 'Conecte suas contas ou registre lançamentos manualmente para ter controle completo.'
  },
  {
    icon: BarChart2LineIcon,
    title: 'Acompanhe seus resultados',
    description: 'Veja relatórios claros e gráficos que mostram seu saldo e tendências de gastos.'
  },
  {
    icon: ChatHeartLineIcon,
    title: 'Receba recomendações',
    description: 'Tenha sugestões práticas para reduzir gastos e melhorar seu planejamento mensal.'
  }
];

export default function Start() {
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const start = windowHeight * 0.8;
      const end = windowHeight * -0.2;
      const current = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
      setProgress(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section id="start" ref={sectionRef} className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <Badge text="Como começar" className="mb-4" />
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Comece a usar o Saldo Verde em poucos passos
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
              Saiba exatamente o que fazer para iniciar o controle financeiro, organizar seus dados e acompanhar seu fluxo com clareza.
            </p>
          </div>

          <div className="grid gap-4">
            {startSteps.map((step, index) => {
              const Icon = step.icon;
              const offset = Math.round(progress * index * 22);
              return (
                <div
                  key={step.title}
                  className="relative rounded-[1.75rem] bg-primary-300 p-6 shadow-sm transition-transform duration-300"
                  style={{
                    transform: `translateY(-${offset}px)`,
                    zIndex: 10 + index
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-primary-700 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{step.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-900/85">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
