'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.18
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const price = billingCycle === 'monthly' ? 'R$ 14,99' : 'R$ 149,90';
  const priceSuffix = billingCycle === 'monthly' ? '/ mês' : '/ ano';
  const billingNote =
    billingCycle === 'monthly'
      ? 'Pague mês a mês e cancele quando quiser.'
      : 'Pague 10x R$ 14,99 e ganhe 2 meses grátis no plano anual.';

  return (
    <motion.section
      id="pricing"
      className="relative scroll-mt-24 bg-slate-50 py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
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
          <motion.div variants={itemVariants}>
            <Badge text="Plano único" Icon={CoinsLineIcon} className="mb-4 bg-primary-300 border-slate-200 text-slate-900" />
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Acesso completo ao Saldo Verde para todas as suas finanças
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
              Experimente todos os recursos essenciais para organizar seu fluxo de caixa, acompanhar metas e controlar gastos sem limitações. Tenha acesso total às funcionalidades avançadas do Saldo Verde por 7 dias, sem custos iniciais.
            </p>

            <Steps labels={pricingStepLabels} className="mt-8 flex flex-wrap gap-4" />
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full border border-primary-300 bg-primary-100 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold text-primary-700 shadow-sm">
                7 dias grátis
              </span>

              <div className="grid gap-2">
                <div className="inline-flex rounded-full bg-slate-100 p-1 sm:p-1.5">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    aria-pressed={billingCycle === 'monthly'}
                    className={`rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition ${
                      billingCycle === 'monthly'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    aria-pressed={billingCycle === 'annual'}
                    className={`rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition ${
                      billingCycle === 'annual'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Anual
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-4xl font-semibold tracking-tight text-slate-900">
                {price}
                <span className="text-base font-medium text-slate-600"> {priceSuffix}</span>
              </p>
              {billingCycle === 'annual' ? (
                <p className="mt-2 inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold text-primary-700 shadow-sm">
                  Ganhe 2 meses grátis
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-slate-500">{billingNote}</p>
            </div>

          

            <ul className="mt-8 space-y-5 text-base text-slate-700">
              <li className="flex items-center gap-3">
                <span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Organize seu dinheiro do seu jeito
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Categorias ilimitadas e personalizadas
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Pare de perder dinheiro sem perceber
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex aspect-square h-7 w-7 items-center justify-center rounded-full border border-primary-300 bg-primary-100 text-primary-700">
                  <CheckFillIcon className="h-4 w-4" />
                </span>
                Veja exatamente pra onde seu dinheiro vai
              </li>
            </ul>

            <div className="mt-10">
              <ButtonCta href="/download" className="w-full justify-center">
                <span className="sm:hidden">Teste grátis 7 dias</span>
                <span className="hidden sm:inline">Teste grátis por 7 dias</span>
              </ButtonCta>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
