import Image from 'next/image';
import Link from 'next/link';

import FacebookLineIcon from 'remixicon-react/FacebookLineIcon';
import InstagramLineIcon from 'remixicon-react/InstagramLineIcon';

import Input from '../../../components/ui/input/input';
import ButtonCta from '../../../components/ui/btn/button-cta';

const navLinks = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Recursos', href: '/#recursos' },
  { label: 'Quem Somos', href: '/#quem-somos' },
  { label: 'Faq', href: '/#faq' },
  { label: 'Contato', href: '/#contato' }
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookLineIcon },
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramLineIcon }
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/95 text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:px-10 lg:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/assets/brand/isologo.png"
              alt="Saldo Verde"
              width={188}
              height={40}
              quality={90}
              className="h-10 w-auto"
              style={{ width: 'auto' }}
            />
          </Link>
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            Controle o seu dinheiro com clareza e encontre o caminho para chegar ao fim do mês com saldo positivo.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-600">Navegação</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-slate-900">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-600">Legal</h3>
          <ul className="space-y-3 text-sm text-slate-700">
            <li>
              <Link href="#" className="transition hover:text-slate-900">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="#" className="transition hover:text-slate-900">
                Termos de Uso
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-600">Newsletter</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Receba dicas práticas de controle financeiro direto no seu email.
            </p>
          </div>
          <div className="grid gap-3">
            <Input type="email" placeholder="Seu melhor email" />
            <ButtonCta>Inscrever</ButtonCta>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold text-slate-700">Redes sociais</p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  <social.Icon className="h-4 w-4 text-slate-600" />
                  {social.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-transparent">
        <div className="h-px w-full bg-slate-200 opacity-60" />
        <div className="mx-auto max-w-7xl px-6 py-5 md:px-10">
          <p className="text-sm text-slate-500 opacity-80">
            ©Saldo Verde - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
