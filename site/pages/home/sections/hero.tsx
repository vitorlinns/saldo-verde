import Badge from '../../../components/ui/badge/badge';
import ButtonCta from '../../../components/ui/btn/button-cta';
import Steps from '../../../components/steps/steps';
import ShieldCheckLineIcon from 'remixicon-react/ShieldCheckLineIcon';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section id="inicio" className="relative scroll-mt-24 bg-slate-50 pt-24 pb-12 sm:pt-28 md:pt-32">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/assets/images/background-hero.png"
          alt="Fundo da seção hero"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative mx-auto grid min-h-[70vh] max-w-7xl gap-12 px-6 md:grid-cols-[1.3fr_0.9fr] md:px-10">
        <div className="flex flex-col justify-center gap-8">
          <article>
            <Badge
              text="A solução que substitui a planilha"
              Icon={ShieldCheckLineIcon}
              className="mb-6 bg-primary-300 border-slate-200 text-slate-900"
            />
            <h1 className="text-4xl font-medium leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Pare de chegar no fim do mês sem saber pra onde foi o dinheiro.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
              Organize seus gastos, entenda seu saldo e tenha controle total da sua vida financeira, sem planilhas e sem complicação.
              </p>
          </article>

          <div className="flex flex-wrap items-center gap-4">
            <ButtonCta href="#pricing">Começar agora</ButtonCta>
          </div>

          <Steps />
        </div>

        <div className="flex items-center justify-center">
          <div className="relative h-[420px] w-full max-w-[620px] overflow-hidden sm:h-[560px]">
            <Image
              src="/assets/images/img-hero.png"
              alt="Imagem do app Saldo Verde"
              fill
              className="object-contain transform scale-115"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
