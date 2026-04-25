'use client';

import { useEffect, useRef } from 'react';
import StarFillIcon from 'remixicon-react/StarFillIcon';

const testimonials = [
  {
    rating: 5,
    score: '5.0',
    content:
      'O Saldo Verde tornou o meu controle financeiro muito mais simples. Agora consigo ver onde gasto e como economizar todo mês.',
    name: 'Ana Beatriz',
    city: 'Curitiba',
  },
  {
    rating: 5,
    score: '4.9',
    content:
      'A interface é leve e clara. Me ajudou a organizar minhas despesas sem perder horas no processo.',
    name: 'Lucas Pereira',
    city: 'São Paulo',
  },
  {
    rating: 5,
    score: '4.8',
    content:
      'Recomendo para quem quer uma visão rápida e prática do saldo e dos gastos mensais.',
    name: 'Marina Costa',
    city: 'Belo Horizonte',
  },
  {
    rating: 5,
    score: '4.9',
    content:
      'Os cards de avaliação deixam tudo mais confiável e fácil de ler. O carrossel é um ótimo toque visual.',
    name: 'Felipe Rocha',
    city: 'Porto Alegre',
  },
];

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
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Depoimentos</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Usuários felizes com resultado real no controle financeiro
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Veja como pessoas de diferentes cidades estão melhorando a gestão do seu dinheiro com o Saldo Verde.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Avaliação média</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">4.9</p>
              </div>
              <div className="rounded-3xl bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700">
                ⭐⭐⭐⭐⭐
              </div>
            </div>
            <p className="mt-6 text-slate-600">
              Nossos usuários aprovam a clareza e a facilidade para controlar gastos, organizar orçamentos e melhorar o saldo ao final do mês.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 overflow-hidden">
        <div className="relative left-1/2 right-1/2 mx-[-50vw] w-screen">
          <div className="overflow-hidden">
            <div ref={trackRef} className="flex gap-6 px-6 lg:px-10 py-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={`${testimonial.name}-${index}`}
                  className="min-w-[280px] max-w-xs shrink-0 rounded-[1.75rem] bg-white p-6 shadow-sm shadow-slate-200/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1 text-amber-400">
                      {Array.from({ length: testimonial.rating }).map((_, itemIndex) => (
                        <StarFillIcon key={itemIndex} className="h-4 w-4" />
                      ))}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                      {testimonial.score}
                    </span>
                  </div>
                  <p className="mt-5 min-h-[96px] text-sm leading-7 text-slate-700">{testimonial.content}</p>
                  <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-600">
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="whitespace-nowrap">{testimonial.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
