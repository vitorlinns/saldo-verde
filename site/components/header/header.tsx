import Image from 'next/image';
import Link from 'next/link';
import HeaderLogin from '../ui/btn/header-login';
import HeaderCta from '../ui/btn/header-cta';

export default function Header() {
  const links = [
    { label: 'Início', href: '/#inicio' },
    { label: 'Recursos', href: '/#recursos' },
    { label: 'Clientes', href: '/#depoimentos' },
    { label: 'Preço', href: '/#pricing' },
    { label: 'Faq', href: '/#faq' },
    { label: 'Contato', href: '/contato' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/assets/brand/isologo.png"
            alt="Saldo Verde"
            width={188}
            height={40}
            quality={90}
            className="h-10 w-auto"
            style={{ width: 'auto' }}
          />
          <span className="sr-only">Saldo Verde</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label="Navegação principal">
            <ul className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-700">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition hover:text-primary-700 focus:outline-none focus:ring-0 focus:border-transparent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <HeaderLogin />
            <HeaderCta />
          </div>
        </div>
      </div>
    </header>
  );
}
