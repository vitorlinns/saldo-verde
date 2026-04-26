import Image from 'next/image';
import AlarmLineIcon from 'remixicon-react/AlarmLineIcon';
import BarChartBoxLineIcon from 'remixicon-react/BarChartBoxLineIcon';
import CalculatorLineIcon from 'remixicon-react/CalculatorLineIcon';
import CalendarLineIcon from 'remixicon-react/CalendarLineIcon';
import LightbulbLineIcon from 'remixicon-react/LightbulbLineIcon';
const features = [
  {
    icon: CalculatorLineIcon,
    title: 'Planejamento automático',
    description: 'Orçamentos inteligentes com limites ajustados por categoria e período.'
  },
  {
    icon: AlarmLineIcon,
    title: 'Alertas e metas inteligentes',
    description: 'Notificações quando você ultrapassa limites ou chega perto do objetivo.'
  },
  {
    icon: CalendarLineIcon,
    title: 'Projeção de saldo mensal',
    description: 'Veja como seu saldo tende a se comportar até o fim do mês.'
  },
  {
    icon: LightbulbLineIcon,
    title: 'Sugestões de economia',
    description: 'Dicas práticas baseadas nos seus hábitos de gasto.'
  }
];

export default function Resources() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-sm shadow-slate-200/40">
            <div className="relative h-[320px] w-full bg-slate-100/70">
              <Image
                src="/assets/images/img-resources.png"
                alt="Visão do recurso Saldo Verde"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-8 pt-8">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 border border-primary-200 text-primary-700">
                  <BarChartBoxLineIcon className="h-6 w-6" />
                </div>
                
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                  Relatórios completos e detalhados
                </h2>
              </div>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-700">
                Veja todas as suas despesas por categoria, período e tendência. Filtros poderosos,
                comparação mês a mês e exportação para análise completa.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-11 w-11 aspect-square items-center justify-center rounded-xl bg-primary-100 border border-primary-300 text-primary-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-950">{feature.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
