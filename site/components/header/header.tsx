'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeaderLogin from '../ui/btn/header-login';
import HeaderCta from '../ui/btn/header-cta';

export default function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: 'Início', href: '/' },
    { label: 'Recursos', href: '/#recursos' },
    { label: 'Clientes', href: '/#depoimentos' },
    { label: 'Preço', href: '/#pricing' },
    { label: 'Sobre nós', href: '/sobre-nos' },
    { label: 'Faq', href: '/#faq' },
    { label: 'Contato', href: '/contato' }
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full min-w-full transform-gpu translate-y-0 border-b border-slate-200 bg-white">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10">
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

        <div className="hidden min-[1151px]:flex items-center gap-6">
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

        <div className="hidden max-[1150px]:flex items-center">
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((current) => !current)}
            className="relative z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-300 text-black shadow-sm transition hover:bg-primary-400 focus:outline-none focus:ring-0"
          >
            <span className="sr-only">Menu</span>
            <span className={`text-2xl font-medium leading-none align-middle transition-transform duration-300 ${open ? 'rotate-45' : 'rotate-0'}`}>
              +
            </span>
          </button>

          {open && (
            <div className="fixed inset-x-0 top-[5.5rem] bottom-0 z-30 bg-slate-950/10" />
          )}

          <div
            className={`fixed inset-x-4 top-[calc(5.5rem+0.75rem)] z-50 mx-auto max-w-[22rem] overflow-hidden rounded-[2rem] bg-white p-5 shadow-lg shadow-slate-200/40 transition-all duration-300 ease-out transform ${open ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none'}`}
            aria-hidden={!open}
          >
            <nav aria-label="Menu mobile">
              <ul className="space-y-3 text-sm font-semibold text-slate-700">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-5 space-y-3">
              <HeaderLogin className="w-full justify-center" />
              <HeaderCta className="w-full justify-center" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
