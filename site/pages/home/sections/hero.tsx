import Badge from '../../../components/ui/badge/badge';
import ButtonCta from '../../../components/ui/btn/button-cta';
import Steps from '../../../components/steps/steps';
import ShieldCheckLineIcon from 'remixicon-react/ShieldCheckLineIcon';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section id="inicio" className="scroll-mt-24 bg-slate-50 pt-20 pb-12 sm:pt-28 md:pt-32">
      <div className="mx-auto grid min-h-[80vh] max-w-7xl gap-12 px-6 md:grid-cols-[1.3fr_0.9fr] md:px-10">
        <div className="flex flex-col justify-center gap-8">
          <article>
            <Badge
              text="A solução que substitui a planilha"
              Icon={ShieldCheckLineIcon}
              className="mb-6 bg-primary-300 border-slate-200 text-slate-900"
            />
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

        <div className="flex items-center justify-center pt-10 md:pt-0">
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
