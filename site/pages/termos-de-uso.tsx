import Head from 'next/head';
import Header from '../components/header/header';
import Footer from './home/sections/footer';
import Badge from '../components/ui/badge/badge';

export default function TermsOfUsePage() {
  return (
    <main>
      <Head>
        <title>Termos de Uso | Saldo Verde</title>
        <link rel="icon" href="/assets/brand/favicon.png" />
      </Head>

      <Header />

      <section className="bg-slate-50 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-4xl space-y-10 text-slate-700">
            <div className="mb-10">
              <Badge
                text="Termos de Uso"
                className="bg-primary-300 border-slate-200 text-slate-900"
              />
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Regras e responsabilidades ao usar o Saldo Verde
              </h1>
              <p className="mt-6 text-base leading-8 text-slate-700">
                Estes termos descrevem como você deve usar o site e os serviços do Saldo Verde, além de suas responsabilidades enquanto usuário.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">1. Uso aceitável</h2>
              <p className="mt-4 leading-8">
                Você concorda em usar o site apenas para fins legais e éticos. Não é permitido tentar acessar, modificar ou interferir em funcionalidades de forma indevida.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">2. Conteúdo e propriedade</h2>
              <p className="mt-4 leading-8">
                Todo o conteúdo, design e marcas do Saldo Verde são de propriedade da plataforma ou de seus licenciadores. O uso não autorizado desses elementos é proibido.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">3. Limitação de responsabilidade</h2>
              <p className="mt-4 leading-8">
                Fornecemos informações e recursos com boa fé, mas não garantimos resultados específicos. Não nos responsabilizamos por decisões financeiras tomadas com base no uso do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">4. Atualizações</h2>
              <p className="mt-4 leading-8">
                Podemos atualizar estes termos a qualquer momento. Recomendamos que você verifique esta página periodicamente para estar ciente de eventuais alterações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">5. Contato</h2>
              <p className="mt-4 leading-8">
                Se tiver dúvidas sobre os termos de uso, entre em contato pelo formulário do site ou através do email suporte@saldoverde.pro.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
