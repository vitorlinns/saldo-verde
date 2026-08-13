# Saldo Verde

Site institucional do Saldo Verde, app de organização financeira pessoal.
Produção: [saldoverde.pro](https://saldoverde.pro)

## Stack

- [Next.js 16](https://nextjs.org/) (React 19, TypeScript, Turbopack)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) para animações
- [Lenis](https://github.com/darkroomengineering/lenis) para smooth scroll

## Pré-requisitos

- Node.js 20.9+ (ver `.nvmrc`)

## Como rodar

```bash
npm install
npm run dev
```

O site sobe em `http://127.0.0.1:3000`.

## Scripts

| Comando         | Descrição                              |
| --------------- | --------------------------------------- |
| `npm run dev`   | Ambiente de desenvolvimento             |
| `npm run build` | Build de produção                       |
| `npm run start` | Sobe o build de produção localmente     |
| `npm run lint`  | Roda o ESLint (flat config, `eslint.config.mjs`) |

## Estrutura

```
app/          # Rotas do App Router (hoje só a home, "/")
pages/        # Rotas do Pages Router (about, contact, download, etc.)
components/   # Componentes reutilizáveis (header, botões, inputs, ...)
public/       # Assets estáticos (fontes, imagens, ícones)
src/data/     # Dados estáticos do site (ex.: texto de copyright)
```

> **Nota:** o projeto mistura App Router (`app/`) e Pages Router (`pages/`)
> — a home vive em `app/page.tsx`, e as demais páginas em `pages/`. As seções
> da home ficam em `pages/home/sections/` e são importadas por `app/page.tsx`;
> como esses arquivos exportam componentes default de dentro de `pages/`, o
> Next.js também os expõe como rotas próprias (ex.: `/home/sections/hero`).
> Isso é uma pendência de arquitetura conhecida, não um comportamento
> intencional — ideal migrar todas as páginas para `app/` e remover `pages/`.

## Deploy

- Domínio de produção: `saldoverde.pro`
- DNS e proxy (CDN/SSL) via Cloudflare, apontando para a Vercel (CNAME com proxy ativado, SSL/TLS em Full strict)
