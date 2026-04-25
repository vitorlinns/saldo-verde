import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saldo Verde',
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
      <body>{children}</body>
    </html>
  );
}
