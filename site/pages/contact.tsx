import Head from 'next/head';
import Header from '../components/header/header';
import Footer from './home/sections/footer';
import Badge from '../components/ui/badge/badge';
import Input from '../components/ui/input/input';
import ButtonCta from '../components/ui/btn/button-cta';
import ChatHeartLineIcon from 'remixicon-react/ChatHeartLineIcon';
import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      // Reset form if needed, or just leave success state
    }, 1500);
  };

  return (
    <main className="scroll-smooth">
      <Head>
        <title>Contato | Saldo Verde</title>
        <link rel="icon" href="/assets/brand/favicon.png" />
      </Head>
      <Header />

      <section className="bg-slate-50 pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-sm shadow-slate-200/40">
            <div className="mb-10 text-left">
              <Badge
                text="Fale com a gente"
                Icon={ChatHeartLineIcon}
                className="mb-6 bg-primary-300 border-slate-200 text-slate-900"
              />
              <h1 className="text-4xl font-medium tracking-tight text-slate-950 sm:text-5xl">
                Precisa de ajuda? Envie-nos uma mensagem.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Preencha o formulário abaixo que nossa equipe entrará em contato em breve.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-3xl grid gap-6"
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <Input
                  name="Nome"
                  type="text"
                  placeholder="Nome"
                  className="rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-slate-200 focus:shadow-none"
                />
                <Input
                  name="Email"
                  type="email"
                  placeholder="Email"
                  className="rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-slate-200 focus:shadow-none"
                />
              </div>

              <Input
                name="Assunto"
                type="text"
                placeholder="Assunto"
                className="rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-slate-200 focus:shadow-none"
              />

              <label className="block">
                <textarea
                  name="Mensagem"
                  rows={6}
                  placeholder="Escreva sua mensagem aqui..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-slate-200 focus:shadow-none"
                />
              </label>

              <div className="mt-4">
                <ButtonCta type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Enviando...' : 'Enviar'}
                </ButtonCta>
              </div>

              {status === 'success' && (
                <div className="mt-2 rounded-xl bg-[#e5f5e8] p-4 text-[#1a5d2b] text-sm font-medium border border-[#c3e6cb]">
                  Mensagem enviada com sucesso! Entraremos em contato em breve.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      <Footer />
      <style jsx>{`
        input:focus,
        textarea:focus {
          outline: none !important;
          box-shadow: none !important;
          border-color: #e2e8f0 !important;
        }
      `}</style>
    </main>
  );
}
