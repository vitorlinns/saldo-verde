'use client';

import { useRouter } from 'next/navigation';

import Header from '../components/header/header';
import Footer from '../pages/home/sections/footer';
import Badge from '../components/ui/badge/badge';
import ButtonCta from '../components/ui/btn/button-cta';

export default function NotFound() {
  const router = useRouter();

  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-10rem)] bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm shadow-slate-200/40">
            <Badge
              text="Página não encontrada"
              className="mb-6 bg-primary-300 border-slate-200 text-slate-900"
            />
            
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Oops! Não encontramos essa página.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              A página que você procura não existe ou foi removida. Volte para a página inicial e continue explorando o Saldo Verde.
            </p>
            <div className="mt-10 flex justify-center">
              <ButtonCta type="button" onClick={() => router.push('/')}>Ir para página inicial</ButtonCta>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
