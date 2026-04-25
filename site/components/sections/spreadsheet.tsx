import Image from 'next/image';
import Badge from '../ui/badge/badge';
import CalculatorLineIcon from 'remixicon-react/CalculatorLineIcon';
import CheckboxCircleLineIcon from 'remixicon-react/CheckboxCircleLineIcon';
import DownloadLineIcon from 'remixicon-react/DownloadLineIcon';
import FileList3LineIcon from 'remixicon-react/FileList3LineIcon';
import BarChartLineIcon from 'remixicon-react/BarChartLineIcon';
import CalendarLineIcon from 'remixicon-react/CalendarLineIcon';

const features = [
  {
    icon: FileList3LineIcon,
    title: 'Registre gastos em segundos',
    description: 'Anote cada compra ou conta sem planilha e sem complicação.'
  },
  {
    icon: BarChartLineIcon,
    title: 'Veja onde seu dinheiro sumiu',
    description: 'Identifique as despesas que mais consomem seu orçamento.'
  },
  {
    icon: CheckboxCircleLineIcon,
    title: 'Tenha controle diário',
    description: 'Organize seus lançamentos por categorias e saiba exatamente quanto já gastou.'
  },
  {
    icon: CalculatorLineIcon,
    title: 'Planeje o mês com calma',
    description: 'Defina metas simples e saiba o que você ainda pode gastar.'
  },
  {
    icon: CalendarLineIcon,
    title: 'Não perca o fim do mês',
    description: 'Veja na hora se você está no caminho certo ou se falta ajustar o orçamento.'
  },
  {
    icon: DownloadLineIcon,
    title: 'Dados prontos para revisão',
    description: 'Exporte ou revise seus números com clareza sempre que precisar.'
  }
];

export default function Spreadsheet() {
  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3);

  return (
    <section className="mx-auto max-w-7xl rounded-[2.5rem] px-6 py-16 md:px-10 bg-primary-300">
      <div className="mb-10 text-center">
        <Badge />
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Substitua o Excel por um app simples e rápido
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-700">
          Lançamentos, totais e organização em uma interface clara – sem fórmulas, sem conexão bancária e sem dor de cabeça.
        </p>
      </div>

      <div className="grid gap-1 justify-items-center xl:grid-cols-[minmax(16rem,1fr)_minmax(18rem,18rem)_minmax(16rem,1fr)] items-center">
        <div className="grid gap-2">
          {leftFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="max-w-[18rem] rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/30">
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

        <div className="w-full max-w-[18rem]">
          <Image
            src="/assets/mockups/tela.png"
            alt="Mockup do app"
            width={720}
            height={460}
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="grid gap-2">
          {rightFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="max-w-[18rem] rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/30">
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
    </section>
  );
}
