'use client';

import { motion } from 'framer-motion';
import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/header/header';
import Footer from './home/sections/footer';
import Badge from '../components/ui/badge/badge';
import BarChartLineIcon from 'remixicon-react/BarChartLineIcon';
import BookOpenLineIcon from 'remixicon-react/BookOpenLineIcon';
import CalendarLineIcon from 'remixicon-react/CalendarLineIcon';
import Testimonials from './home/sections/testimonials';
import Faq from './home/sections/faq';

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.18,
    },
  },
};

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function AboutPage() {
  return (
    <main className="scroll-smooth">
      <Head>
        <title>Sobre nós | Saldo Verde</title>
        <link rel="icon" href="/assets/brand/favicon.png" />
      </Head>

      <Header />

      <motion.section
        id="sobre-nos"
        className="bg-slate-50 py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={sectionVariants}
      >
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr]">
            <motion.div className="flex flex-col justify-center gap-8" variants={revealVariants}>
              <Badge
                text="Sobre nós"
                className="bg-primary-300 border-slate-200 text-slate-900"
              />
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Saldo Verde ajuda você a cuidar melhor do seu dinheiro
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
                  Nossa proposta é apoiar pessoas na construção de hábitos financeiros mais saudáveis, com clareza e simplicidade em cada passo.
                </p>
              </div>
              <div className="space-y-6 text-slate-700">
                <p>
                  O Saldo Verde nasceu para tirar o financeiro do escuro. Aqui, você encontra um jeito mais leve de acompanhar gastos, planejar o mês e entender melhor como usar seu dinheiro.
                </p>
                <p>
                  Não queremos só mostrar números: queremos oferecer educação financeira prática para que cada pessoa consiga tomar decisões mais conscientes e seguras.
                </p>
              </div>
            </motion.div>

            <motion.div className="flex items-center justify-center mt-10 md:mt-0" variants={revealVariants}>
              <div className="relative h-[420px] w-full max-w-[620px] overflow-hidden sm:h-[520px]">
                <Image
                  src="/assets/images/img-about.webp"
                  alt="Imagem do app Saldo Verde"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>

          <motion.div className="mt-16 grid gap-6 lg:grid-cols-3" variants={sectionVariants}>
            <motion.article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/30" variants={cardVariants}>
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-950">
                <BarChartLineIcon className="h-5 w-5 text-primary-300" />
                Clareza no orçamento
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Mostramos de forma simples para onde vai o seu dinheiro, ajudando você a identificar gastos e a ajustar o orçamento sem complicação.
              </p>
            </motion.article>

            <motion.article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/30" variants={cardVariants}>
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-950">
                <BookOpenLineIcon className="h-5 w-5 text-primary-300" />
                Educação financeira
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Nosso foco é ensinar o básico de forma prática, para que qualquer pessoa possa tomar melhores decisões financeiras a cada mês.
              </p>
            </motion.article>

            <motion.article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/30" variants={cardVariants}>
              <h2 className="flex items-center gap-3 text-xl font-semibold text-slate-950">
                <CalendarLineIcon className="h-5 w-5 text-primary-300" />
                Controle diário
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Com o Saldo Verde você acompanha lançamentos, metas e saldo de forma contínua, sem depender de planilhas ou fórmulas complexas.
              </p>
            </motion.article>
          </motion.div>
        </div>
      </motion.section>

      <Testimonials />
      <Faq />

      <Footer />
    </main>
  );
}
