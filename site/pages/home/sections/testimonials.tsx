'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import StarFillIcon from 'remixicon-react/StarFillIcon';

import Badge from '../../../components/ui/badge/badge';
import ButtonCta from '../../../components/ui/btn/button-cta';

const testimonials = [
  {
    rating: 5,
    score: '5.0',
    content:
      'Com o Saldo Verde, finalmente consegui enxergar o orçamento da minha casa sem complicação. Hoje sei exatamente quanto posso gastar e quanto devo guardar.',
    name: 'João Almeida',
    city: 'Fortaleza',
    avatar: '/assets/clients/sv-4.webp',
  },
  {
    rating: 5,
    score: '4.9',
    content:
      'A ferramenta me ajudou a organizar despesas e contas do mês. Passei a entender onde cortar gastos e a planejar melhor os pagamentos.',
    name: 'Rafael Santos',
    city: 'Curitiba',
    avatar: '/assets/clients/sv-2.webp',
  },
  {
    rating: 5,
    score: '4.8',
    content:
      'Agora acompanho todas as minhas despesas em poucos minutos. O Saldo Verde me deu mais segurança para cuidar do meu dinheiro.',
    name: 'Marina Costa',
    city: 'Belo Horizonte',
    avatar: '/assets/clients/sv-3.webp',
  },
  {
    rating: 5,
    score: '4.9',
    content:
      'Foi muito fácil começar a usar e o app virou meu parceiro nas finanças diárias. Sinto que finalmente tenho controle do orçamento.',
    name: 'Camila Martins',
    city: 'São Paulo',
    avatar: '/assets/clients/sv-1.webp',
  },
];

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.16,
    },
  },
};

const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const wrapper = track.parentElement;
    if (!wrapper) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || '0');

    while (track.scrollWidth < wrapper.offsetWidth * 2) {
      const cloneIndex = track.children.length % testimonials.length;
      const clone = track.children[cloneIndex].cloneNode(true) as HTMLElement;
      track.appendChild(clone);
      if (track.children.length > testimonials.length * 10) break;
    }

    let previousTimestamp = performance.now();
    const speed = 0.04;

    const animate = (timestamp: number) => {
      const delta = timestamp - previousTimestamp;
      previousTimestamp = timestamp;
      offsetRef.current -= delta * speed;

      const firstChild = track.firstElementChild as HTMLElement | null;
      if (firstChild) {
        const firstWidth = firstChild.offsetWidth + gap;
        if (-offsetRef.current >= firstWidth) {
          offsetRef.current += firstWidth;
          track.appendChild(firstChild);
        }
      }

      track.style.transform = `translateX(${offsetRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <motion.section
      id="depoimentos"
      className="scroll-mt-24 bg-slate-50 py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <motion.div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end" variants={revealVariants}>
          <div className="max-w-3xl">
            <Badge
              text="Depoimentos"
              Icon={StarFillIcon}
              className="bg-primary-300 border-slate-200 text-slate-900"
            />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Clientes felizes com resultado real no controle do seu dinheiro
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Veja como pessoas de diferentes cidades estão melhorando a gestão do seu dinheiro com o Saldo Verde.
            </p>
          </div>
          <motion.div className="rounded-[2rem] bg-primary-300 p-6 shadow-lg shadow-primary-300/30 text-slate-900" variants={revealVariants}>
            <div className="flex items-center justify-between gap-4">
              <Badge
                text="Avaliação média | 4.9"
                Icon={StarFillIcon}
                className="bg-white border-transparent text-slate-900"
              />
            </div>
            <p className="mt-6 text-slate-900/90">
              Nossos usuários aprovam a clareza e a facilidade para controlar gastos, organizar orçamentos e melhorar o saldo ao final do mês.
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="mt-12 overflow-hidden" variants={revealVariants}>
        <div className="relative left-1/2 right-1/2 mx-[-50vw] w-screen">
          <div className="overflow-hidden">
            <div ref={trackRef} className="flex gap-6 px-6 lg:px-10 py-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.name}-${index}`}
                  className="min-w-[280px] max-w-xs shrink-0 rounded-[1.75rem] bg-white p-6 shadow-sm shadow-slate-200/30 border border-slate-200 flex h-[330px] flex-col"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1 text-primary-300">
                      {Array.from({ length: testimonial.rating }).map((_, itemIndex) => (
                        <StarFillIcon key={itemIndex} className="h-4 w-4" />
                      ))}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                      {testimonial.score}
                    </span>
                  </div>
                  <p className="mt-5 flex-1 text-sm leading-7 text-slate-700">{testimonial.content}</p>
                  <div className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-100">
                        <Image
                          src={testimonial.avatar}
                          alt={`Foto de ${testimonial.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{testimonial.name}</div>
                        <div className="text-xs text-slate-500">{testimonial.city}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div className="mx-auto mt-10 max-w-7xl px-6 lg:px-10" variants={revealVariants}>
        <div className="max-w-2xl text-left">
          <p className="text-lg font-semibold text-slate-900">
            Pronto para transformar seu controle financeiro em algo simples e seguro?
          </p>
          <motion.div className="mt-4 inline-flex rounded-full" whileHover={{ y: -2, scale: 1.02 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
            <ButtonCta href="#pricing">Quero testar agora</ButtonCta>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
