import Badge from '../../../components/ui/badge/badge';
import ButtonCta from '../../../components/ui/btn/button-cta';
import CheckFillIcon from 'remixicon-react/CheckFillIcon';
import CoinsLineIcon from 'remixicon-react/CoinsLineIcon';
import Steps from '../../../components/steps/steps';
import Image from 'next/image';

const pricingStepLabels = [
  'Sem compromisso',
  'Cancelamento fácil',
  'Sem necessidade de cartão'
];

export default function Pricing() {
  return (
    <section id="pricing" className="relative scroll-mt-24 bg-slate-50 py-20">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/images/background-hero.png"
          alt="Fundo da seção de preços"
          fill
          className="object-cover"
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge text="Plano único" Icon={CoinsLineIcon} className="mb-4 bg-primary-300 border-slate-200 text-slate-900" />
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Acesso completo ao Saldo Verde para todas as suas finanças
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
              Experimente todos os recursos essenciais para organizar seu fluxo de caixa, acompanhar metas e controlar gastos sem limitações.
            </p>

            <Steps labels={pricingStepLabels} className="mt-8 flex flex-wrap gap-4" />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <span className="rounded-full border border-primary-300 bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
                7 dias grátis
              </span>
              <div>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                  R$ 14,99
                  <span className="text-base font-medium text-slate-600">/ mês</span>
                </p>
              </div>
            </div>

            <p className="mt-6 text-base leading-8 text-slate-600">
              Tenha acesso total às funcionalidades avançadas do Saldo Verde por 7 dias, sem custos iniciais.
            </p>

            <ul className="mt-8 space-y-5 text-base text-slate-700">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Dashboard completo com projeção de saldo e gráficos
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Categorias ilimitadas e metas personalizadas
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Alertas inteligentes e relatórios detalhados
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Integrações e suporte prioritário
              </li>
            </ul>

            <div className="mt-10">
              <ButtonCta href="/download" className="w-full justify-center">
                <span className="sm:hidden">Teste grátis 7 dias</span>
                <span className="hidden sm:inline">Teste grátis por 7 dias</span>
              </ButtonCta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
