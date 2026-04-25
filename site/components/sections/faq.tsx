'use client';

import { useEffect, useRef, useState } from 'react';
import AddLineIcon from 'remixicon-react/AddLineIcon';
import QuestionLineIcon from 'remixicon-react/QuestionLineIcon';
import SubtractLineIcon from 'remixicon-react/SubtractLineIcon';

import Badge from '../ui/badge/badge';

const faqItems = [
  {
    question: 'Como posso começar a usar o Saldo Verde?',
    answer:
      'Basta criar sua conta, conectar suas contas ou inserir suas despesas e receitas manualmente. O painel é pensado para trazer clareza imediata ao seu fluxo de caixa.',
  },
  {
    question: 'O app funciona com orçamento mensal?',
    answer:
      'Sim. Você pode acompanhar seu orçamento do mês, ver onde está gastando mais e receber alertas visuais para evitar surpresas no fim do período.',
  },
  {
    question: 'Posso controlar várias categorias de gastos?',
    answer:
      'Sim. O Saldo Verde organiza despesas por categorias, tornando fácil identificar padrões e encontrar oportunidades de economia.',
  },
  {
    question: 'É possível usar sem sincronizar contas bancárias?',
    answer:
      'Sim. O app também aceita lançamentos manuais de receitas e despesas para quem prefere manter o controle sem integrações automáticas.',
  },
];

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
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left"
      >
        <div>
          <p className="text-lg font-semibold text-slate-900">{question}</p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-all duration-200">
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
    <section id="faq" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-3xl lg:pr-10">
            <Badge text="Dúvidas" Icon={QuestionLineIcon} className="mb-6" />
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Dúvidas frequentes sobre o controle do seu fluxo financeiro
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Respostas claras para as perguntas mais comuns sobre como aproveitar melhor o Saldo Verde.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FaqAccordionItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
