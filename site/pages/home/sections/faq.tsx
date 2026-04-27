'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import AddLineIcon from 'remixicon-react/AddLineIcon';
import QuestionLineIcon from 'remixicon-react/QuestionLineIcon';
import SubtractLineIcon from 'remixicon-react/SubtractLineIcon';

import Badge from '../../../components/ui/badge/badge';

const faqItems = [
  {
    question: 'Como posso começar a usar o Saldo Verde?',
    answer:
      'Basta criar sua conta e começar a registrar receitas e despesas manualmente. O app foi feito para ser simples desde o primeiro uso.',
  },
  {
    question: 'O app funciona com orçamento mensal?',
    answer:
      'Sim. Você pode acompanhar seu dinheiro mês a mês, ver onde está gastando mais e ajustar seus gastos antes do fim do período.',
  },
  {
    question: 'Posso controlar várias categorias de despesas?',
    answer:
      'Sim. O Saldo Verde organiza seus lançamentos por categoria, ajudando você a identificar onde o dinheiro está indo.',
  },
  {
    question: 'O app integra com bancos automaticamente?',
    answer:
      'Não. O Saldo Verde não faz integração com bancos. Você registra suas receitas e despesas manualmente, sem precisar de acesso à sua conta bancária.',
  },
  {
    question: 'O app substitui planilhas como Excel?',
    answer:
      'Sim. Ele oferece controle rápido e direto do seu dinheiro em vez de fórmulas e abas várias, deixando tudo mais prático e acessível.',
  },
  {
    question: 'Consigo acompanhar minhas metas e saldo com rapidez?',
    answer:
      'Sim. Você vê o saldo atualizado, as metas e os lançamentos com clareza, sem perder tempo em ajustes ou cálculos manuais.',
  },
];

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

function FaqAccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [height, setHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
      >
        <div>
          <p className="text-lg font-semibold text-slate-900">{question}</p>
        </div>
        <span className="inline-flex h-11 w-11 aspect-square items-center justify-center rounded-full bg-primary-100 border border-primary-300 text-primary-700 transition-all duration-200">
          {isOpen ? <SubtractLineIcon className="h-5 w-5" /> : <AddLineIcon className="h-5 w-5" />}
        </span>
      </button>

      <div
        className="overflow-hidden transition-[height,opacity] duration-500 ease-out"
        style={{ height: isOpen ? `${height}px` : '0px' }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="px-6 pb-6 pt-0 opacity-100">
          <p className="text-sm leading-7 text-slate-600">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <motion.section
      id="faq"
      className="scroll-mt-24 bg-slate-50 py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start" variants={revealVariants}>
          <div className="max-w-3xl lg:pr-10">
            <Badge text="Dúvidas" Icon={QuestionLineIcon} className="mb-6 bg-primary-300 border-slate-200 text-slate-900" />
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Dúvidas frequentes sobre o controle do seu fluxo financeiro
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Respostas claras para as perguntas mais comuns sobre como aproveitar melhor o Saldo Verde.
            </p>
          </div>

          <motion.div className="space-y-4" variants={sectionVariants}>
            {faqItems.map((item, index) => (
              <motion.div key={item.question} variants={itemVariants}>
                <FaqAccordionItem
                  question={item.question}
                  answer={item.answer}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
