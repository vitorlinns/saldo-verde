'use client';

import { motion } from 'framer-motion';
import Badge from '../../../components/ui/badge/badge';
import ButtonCta from '../../../components/ui/btn/button-cta';
import Steps from '../../../components/steps/steps';
import ShieldCheckLineIcon from 'remixicon-react/ShieldCheckLineIcon';
import Image from 'next/image';

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } }
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.18
    }
  }
};

const buttonHover = {
  whileHover: { y: -2, scale: 1.02 },
  transition: { type: 'spring', stiffness: 300, damping: 22 }
};

export default function HeroSection() {
  return (
    <section id="inicio" className="relative scroll-mt-24 bg-slate-50 pt-24 pb-12 sm:pt-28 md:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/images/background-hero.webp"
          alt="Fundo da seção hero"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative mx-auto grid min-h-[70vh] max-w-7xl gap-12 px-6 md:grid-cols-[1.3fr_0.9fr] md:px-10">
        <motion.div
          className="flex flex-col justify-center gap-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.article variants={textVariants}>
            <Badge
              text="A solução que substitui a planilha"
              Icon={ShieldCheckLineIcon}
              className="mb-6 bg-primary-300 border-slate-200 text-slate-900"
            />
            <motion.h1
              className="text-4xl font-medium leading-tight tracking-tight text-slate-950 sm:text-5xl"
              variants={textVariants}
            >
              Pare de chegar no fim do mês sem saber pra onde foi o dinheiro.
            </motion.h1>
            <motion.p
              className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl"
              variants={textVariants}
            >
              Organize seus gastos, entenda seu saldo e tenha controle total da sua vida financeira, sem planilhas e sem complicação.
            </motion.p>
          </motion.article>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            variants={textVariants}
            whileHover={buttonHover.whileHover}
            transition={buttonHover.transition}
          >
            <ButtonCta href="#pricing">Começar agora</ButtonCta>
          </motion.div>

          <motion.div variants={textVariants}>
            <Steps />
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
        >
          <div className="relative h-[420px] w-full max-w-[620px] overflow-hidden sm:h-[560px]">
            <Image
              src="/assets/images/img-hero.webp"
              alt="Imagem do app Saldo Verde"
              fill
              className="object-contain transform scale-115"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
