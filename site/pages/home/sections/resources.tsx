import Image from 'next/image';
import AlarmLineIcon from 'remixicon-react/AlarmLineIcon';
import BarChartBoxLineIcon from 'remixicon-react/BarChartBoxLineIcon';
import CalculatorLineIcon from 'remixicon-react/CalculatorLineIcon';
import CalendarLineIcon from 'remixicon-react/CalendarLineIcon';
import LightbulbLineIcon from 'remixicon-react/LightbulbLineIcon';
import Badge from '../../../components/ui/badge/badge';
import ButtonCta from '../../../components/ui/btn/button-cta';

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
    <section id="recursos" className="scroll-mt-24 bg-slate-50 pt-10">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="mb-12 max-w-3xl text-left">
          <Badge text="Recursos em destaque" Icon={BarChartBoxLineIcon} className="mb-4 bg-primary-300 border-slate-200 text-slate-900" />
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Descubra como o app simplifica seus relatórios financeiros
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-700">
            Relatórios, projeções e alertas organizados para você tomar decisões com mais segurança e velocidade.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-sm shadow-slate-200/40">
            <div className="relative w-full h-[170px] sm:h-[190px] md:h-[210px] bg-slate-100/70 overflow-hidden">
              <div className="absolute inset-0 block md:hidden">
                <Image
                  src="/assets/images/img-resources-mobile.png"
                  alt="Visão do recurso Saldo Verde"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="absolute inset-0 hidden md:block">
                <Image
                  src="/assets/images/img-resources.png"
                  alt="Visão do recurso Saldo Verde"
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-10 w-10 aspect-square items-center justify-center rounded-xl bg-primary-100 border border-primary-300 text-primary-700">
                  <BarChartBoxLineIcon className="h-5 w-5" />
                </div>
                
                <h2 className="text-base font-semibold tracking-tight text-slate-950 sm:text-2xl">
                  Relatórios completos e detalhados
                </h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">
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

        <div className="mt-10 max-w-2xl text-left mb-16">
          <p className="text-lg font-semibold text-slate-900">
            Pronto para ver seus resultados em relatórios reais?
          </p>
          <div className="mt-4">
            <ButtonCta href="#pricing">Quero testar agora</ButtonCta>
          </div>
        </div>
      </div>
    </section>
  );
}
