import Head from 'next/head';
import Header from '../components/header/header';
import Footer from './home/sections/footer';
import Badge from '../components/ui/badge/badge';

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Head>
        <title>Política de Privacidade | Saldo Verde</title>
        <link rel="icon" href="/assets/brand/favicon.png" />
      </Head>

      <Header />

      <section className="bg-slate-50 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="max-w-4xl space-y-10 text-slate-700">
            <div className="mb-10">
              <Badge
                text="Política de Privacidade"
                className="bg-primary-300 border-slate-200 text-slate-900"
              />
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Como o Saldo Verde coleta, usa e protege seus dados
              </h1>
              <p className="mt-6 text-base leading-8 text-slate-700">
                Esta política explica as informações que coletamos quando você usa nosso site e como mantemos seus dados seguros e sob controle.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">1. Dados que coletamos</h2>
              <p className="mt-4 leading-8">
                Coletamos apenas os dados necessários para contato e produtividade do serviço. Isso inclui nome, email e mensagem quando você preenche nosso formulário de contato.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">2. Como usamos seus dados</h2>
              <p className="mt-4 leading-8">
                Utilizamos suas informações para responder a dúvidas, prestar suporte, enviar comunicações importantes e melhorar a experiência do site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">3. Compartilhamento de informações</h2>
              <p className="mt-4 leading-8">
                Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins de marketing. Podemos compartilhar informações com provedores de serviço que nos ajudam a operar o site e processar mensagens.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">4. Segurança</h2>
              <p className="mt-4 leading-8">
                Adotamos medidas técnicas e administrativas para proteger seus dados contra acesso não autorizado, perda ou vazamento. Embora façamos o máximo para proteger suas informações, nenhum método é totalmente infalível.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">5. Seus direitos</h2>
              <p className="mt-4 leading-8">
                Você pode entrar em contato conosco a qualquer momento para solicitar correção ou exclusão de dados pessoais. Se tiver dúvidas sobre como seus dados são utilizados, estamos à disposição para esclarecer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-950">6. Contato</h2>
              <p className="mt-4 leading-8">
                Para solicitar informações sobre privacidade, envie uma mensagem pelo nosso formulário de contato ou escreva para suporte@saldoverde.pro.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
