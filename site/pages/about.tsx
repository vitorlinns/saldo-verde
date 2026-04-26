import Head from 'next/head';
import Image from 'next/image';
import Header from '../components/header/header';
import Footer from './home/sections/footer';
import Badge from '../components/ui/badge/badge';

export default function AboutPage() {
  return (
    <main>
      <Head>
        <title>Sobre nós | Saldo Verde</title>
        <link rel="icon" href="/assets/brand/favicon.png" />
      </Head>

      <Header />

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 py-4 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="flex flex-col justify-center gap-8">
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
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="relative h-[560px] w-full max-w-[620px] overflow-hidden">
                <Image
                  src="/assets/images/img-hero.png"
                  alt="Imagem do app Saldo Verde"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/30">
              <h2 className="text-xl font-semibold text-slate-950">Clareza no orçamento</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Mostramos de forma simples para onde vai o seu dinheiro, ajudando você a identificar gastos e a ajustar o orçamento sem complicação.
              </p>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/30">
              <h2 className="text-xl font-semibold text-slate-950">Educação financeira acessível</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Nosso foco é ensinar o básico de forma prática, para que qualquer pessoa possa tomar melhores decisões financeiras a cada mês.
              </p>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/30">
              <h2 className="text-xl font-semibold text-slate-950">Controle diário</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Com o Saldo Verde você acompanha lançamentos, metas e saldo de forma contínua, sem depender de planilhas ou fórmulas complexas.
              </p>
            </article>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
