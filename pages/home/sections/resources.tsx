'use client';

import { motion } from 'framer-motion';
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
    title: 'Registrar receitas e despesas',
    description: 'Registre entradas e saídas em segundos para entender onde seu dinheiro entra e sai.'
  },
  {
    icon: AlarmLineIcon,
    title: 'Consultar saldo atualizado',
    description: 'Veja seu saldo real na hora, com todas as categorias e contas consolidadas.'
  },
  {
    icon: CalendarLineIcon,
    title: 'Definir metas financeiras',
    description: 'Escolha objetivos de economia e acompanhe o progresso até o resultado.'
  },
  {
    icon: LightbulbLineIcon,
    title: 'Alertas de gastos',
    description: 'Receba avisos antes de ultrapassar o limite e mantenha seu orçamento sob controle.'
  }
];

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.18
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

export default function Resources() {
  return (
    <motion.section
      id="recursos"
      className="scroll-mt-24 bg-slate-50 pt-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={listVariants}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <motion.div className="mb-12 max-w-3xl text-left" variants={revealVariants}>
          <Badge text="Controle no bolso" Icon={BarChartBoxLineIcon} className="mb-4 bg-primary-300 border-slate-200 text-slate-900" />
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Registre receitas, despesas, consulte saldo e defina metas em um só lugar
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-700">
            Use o app para acompanhar entradas e saídas em tempo real, manter seu saldo sob controle e atingir objetivos financeiros com mais clareza.
          </p>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white/95 shadow-sm shadow-slate-200/40" variants={itemVariants}>
            <div className="relative w-full h-[170px] sm:h-[190px] md:h-[210px] bg-slate-100/70 overflow-hidden">
              <div className="absolute inset-0 block md:hidden">
                <Image
                  src="/assets/images/img-resources-mobile.webp"
                  alt="Visão do recurso Saldo Verde"
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="absolute inset-0 hidden md:block">
                <Image
                  src="/assets/images/img-resources.webp"
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
                  Registre e acompanhe seu dinheiro em segundos
                </h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Lance receitas e despesas com rapidez, consulte o saldo atualizado e veja seu orçamento sempre alinhado com suas metas.
              </p>
            </div>
          </motion.div>

          <motion.div className="grid gap-6 sm:grid-cols-2" variants={listVariants}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6" variants={itemVariants}>
                  <div className="flex items-center gap-4">
                    <div className="inline-flex h-11 w-11 aspect-square items-center justify-center rounded-xl bg-primary-100 border border-primary-300 text-primary-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-950">{feature.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        <motion.div className="mt-10 max-w-2xl text-left mb-16" variants={revealVariants}>
          <p className="text-lg font-semibold text-slate-900">
            Pronto para começar a controlar receitas, despesas e saldo com facilidade?
          </p>
          <motion.div className="mt-4 inline-flex rounded-full" whileHover={{ y: -2, scale: 1.02 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
            <ButtonCta href="#pricing">Quero testar agora</ButtonCta>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
