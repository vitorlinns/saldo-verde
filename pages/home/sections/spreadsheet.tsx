'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Badge from '../../../components/ui/badge/badge';
import CalculatorLineIcon from 'remixicon-react/CalculatorLineIcon';
import CheckboxCircleLineIcon from 'remixicon-react/CheckboxCircleLineIcon';
import DownloadLineIcon from 'remixicon-react/DownloadLineIcon';
import FileList3LineIcon from 'remixicon-react/FileList3LineIcon';
import BarChartLineIcon from 'remixicon-react/BarChartLineIcon';
import CalendarLineIcon from 'remixicon-react/CalendarLineIcon';

const features = [
  {
    icon: FileList3LineIcon,
    title: 'Registre receitas e despesas rápido',
    description: 'Lance entradas e saídas em poucos toques, sem precisar de planilha ou fórmulas.'
  },
  {
    icon: BarChartLineIcon,
    title: 'Saldo claro em tempo real',
    description: 'Veja seu saldo atualizado instantaneamente e saiba quanto ainda pode gastar.'
  },
  {
    icon: CheckboxCircleLineIcon,
    title: 'Controle diário sem complicação',
    description: 'Organize seus lançamentos por categoria e acompanhe o dia a dia com facilidade.'
  },
  {
    icon: CalculatorLineIcon,
    title: 'Substitui Excel com inteligência',
    description: 'Tenha a mesma fidelidade dos dados do Excel, mas de forma muito mais simples.'
  },
  {
    icon: CalendarLineIcon,
    title: 'Defina metas e acompanhe progresso',
    description: 'Crie objetivos de economia e veja se está no caminho certo todo mês.'
  },
  {
    icon: DownloadLineIcon,
    title: 'Relatórios rápidos e práticos',
    description: 'Tenha relatórios claros e acessíveis sempre que precisar tomar uma decisão.'
  }
];

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
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

export default function Spreadsheet() {
  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3);

  return (
    <motion.section
      className="bg-slate-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={listVariants}
    >
      <div className="mx-auto max-w-7xl rounded-[2.5rem] px-6 py-16 md:px-10 bg-primary-300 bg-[url('/assets/images/background-spreadsheet.webp')] bg-cover bg-center bg-no-repeat">
        <motion.div className="mb-10 text-left max-w-3xl md:text-center md:mx-auto" variants={revealVariants}>
          <Badge
            text="Sem Excel, mais velocidade"
            Icon={FileList3LineIcon}
            className="bg-primary-300 border-slate-200 text-slate-900"
          />
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Faça tudo rápido: registre despesas, consulte saldo e acompanhe metas
          </h2>
          <p className="mt-4 text-base leading-8 text-black">
            Um app prático e intuitivo que substitui planilhas, deixa seus dados claros e acelera o controle financeiro do dia a dia.
          </p>
        </motion.div>

      <div className="grid place-items-center gap-4 xl:grid-cols-[minmax(16rem,18rem)_minmax(20rem,20rem)_minmax(16rem,18rem)] xl:justify-items-stretch xl:justify-center">
        <motion.div className="grid gap-4 w-full max-w-none mx-auto xl:max-w-[18rem]" variants={listVariants}>
          {leftFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} className="w-full rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/30" variants={itemVariants}>
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

        <motion.div className="w-full max-w-[24rem] mx-auto xl:w-full xl:max-w-[20rem]" variants={itemVariants}>
          <Image
            src="/assets/mockups/tela.png"
            alt="Mockup do app"
            width={720}
            height={460}
            className="h-auto w-full object-contain"
            style={{ width: '100%', height: 'auto' }}
          />
        </motion.div>

        <motion.div className="grid gap-4 w-full max-w-none mx-auto xl:max-w-[18rem]" variants={listVariants}>
          {rightFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} className="w-full rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/30" variants={itemVariants}>
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
    </div>
    </motion.section>
  );
}
