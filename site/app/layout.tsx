import type { Metadata } from 'next';
import './globals.css';
import ClearServiceWorker from '../components/clear-service-worker';
import SmoothScroll from '../components/ui/scroll/scroll';

export const metadata: Metadata = {
  title: 'Saldo Verde | Saiba pra onde vai o seu dinheiro',
  description: 'Organize suas finanças com o Saldo Verde.',
  icons: {
    icon: '/assets/brand/favicon.png'
  },
  openGraph: {
    title: 'Saldo Verde',
    description: 'Organize suas finanças com o Saldo Verde.',
    url: 'https://saldoverde.pro'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preload critical fonts */}
        <link rel="preload" href="/assets/fonts/funnel-display/FunnelDisplay-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/funnel-display/FunnelDisplay-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/fonts/funnel-display/FunnelDisplay-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <ClearServiceWorker />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
