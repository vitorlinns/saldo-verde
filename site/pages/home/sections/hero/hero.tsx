import Badge from '../../../../components/ui/badge/badge';
import ButtonCta from '../../../../components/ui/btn/button-cta';
import Steps from '../../../../components/steps/steps';

export default function HeroSection() {
  return (
    <section>
      <div className="mx-auto grid min-h-[80vh] max-w-6xl gap-12 px-6 py-12 md:grid-cols-[1.3fr_0.9fr] md:px-10">
        <div className="flex flex-col justify-center gap-8">
          <Badge />

          <article>
            <h1 className="text-4xl font-medium leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Pare de perder dinheiro sem saber para onde ele vai.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
              Saldo Verde é um software pensado para quem sente que o salário some antes do fim do mês. Acompanhe despesas, organize compras e ganhe clareza financeira de verdade.
            </p>
          </article>

          <div className="flex flex-wrap items-center gap-4">
            <ButtonCta />
          </div>

          <Steps />
        </div>

        <div className="hidden md:block" />
      </div>
    </section>
  );
}
