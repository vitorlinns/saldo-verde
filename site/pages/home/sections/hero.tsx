import Link from 'next/link';

function HeroSection() {
  const features = [
    {
      title: 'Dashboard intuitivo',
      description: 'Visão clara de receitas, despesas e metas em um painel interativo.'
    },
    {
      title: 'Animações suaves',
      description: 'Microinterações que tornam o uso mais agradável e confiável.'
    },
    {
      title: 'Foco no seu dinheiro',
      description: 'Conteúdo criado para quem quer organizar finanças pessoais e pequenas empresas.'
    }
  ];

  return (
    <section className="bg-[radial-gradient(circle_at_top,_rgba(72,187,120,0.12)_0%,_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12)_0%,_transparent_24%)]">
      <div className="mx-auto flex min-h-screen flex-col justify-center max-w-6xl px-6 py-12 md:px-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-900 shadow-[0_10px_35px_rgba(34,197,94,0.12)]">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            Lançamento do site institucional
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Saldo Verde: finanças organizadas com clareza e inteligência.
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
            Um site moderno para apresentar sua solução financeira, com animações suaves, interação visual e um visual profissional para o público que quer controlar gastos, metas e investimentos.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/#contato" className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-700">
              Vamos começar
            </Link>
            <Link href="/#recursos" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50">
              Recursos
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">{feature.title}</h2>
              <p className="mt-3 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
