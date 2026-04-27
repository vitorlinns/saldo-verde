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
      <body>
        <ClearServiceWorker />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
