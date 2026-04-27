import Head from 'next/head';
import Header from '../components/header/header';
import Footer from '../pages/home/sections/footer';
import Badge from '../components/ui/badge/badge';
import ButtonCta from '../components/ui/btn/button-cta';
import AndroidFillIcon from 'remixicon-react/AndroidFillIcon';
import DownloadLineIcon from 'remixicon-react/DownloadLineIcon';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

export default function DownloadPage() {
  const downloadUrl = '#';

  return (
    <>
      <Head>
        <title>Download | Saldo Verde</title>
        <link rel="icon" href="/assets/brand/favicon.png" />
      </Head>
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="pt-28">
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col justify-center gap-8">
            <Badge text="Baixar app Saldo Verde" Icon={AndroidFillIcon} className="mb-4 bg-primary-300 border-slate-200 text-slate-900" />
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Baixe o app Saldo Verde para Android
              </h1>
            </div>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700 sm:text-xl">
               Com o aplicativo Saldo Verde, você terá relatórios rápidos, alertas em tempo real e um jeito mais simples de organizar seu dinheiro e saber pra onde ele está indo, sem surpresas no fim do mês.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <ButtonCta href="#">Baixar App</ButtonCta>
              <div className="inline-flex items-center rounded-full px-3 py-2">
                <Image
                  src="/assets/images/google-play.png"
                  alt="Google Play"
                  width={100}
                  height={32}
                  className="h-auto w-auto"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="group flex h-full max-w-sm flex-col items-center justify-center rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm shadow-slate-200/40">
              <div className="mb-6 inline-flex h-44 w-44 items-center justify-center rounded-3xl bg-slate-100 text-primary-900 transition">
                <QRCode value={downloadUrl} size={180} bgColor="#f8fafc" fgColor="#0f172a" />
              </div>
              <p className="text-xl font-semibold tracking-tight text-slate-950">Escaneie o QR Code</p>
            </div>
          </div>
        </div>
      </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
