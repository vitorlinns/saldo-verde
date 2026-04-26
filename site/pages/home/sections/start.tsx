import Badge from '../../../components/ui/badge/badge';
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
  return (
    <section id="start" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Badge text="Como começar" className="mb-4" />
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Comece a usar o Saldo Verde em poucos passos
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
              Saiba exatamente o que fazer para iniciar o controle financeiro, organizar seus dados e acompanhar seu fluxo com clareza.
            </p>
          </div>

          <div>
            <div className="grid gap-6">
              {startSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="rounded-[1.75rem] bg-primary-300 p-6 shadow-sm"
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
      </div>
    </section>
  );
}
