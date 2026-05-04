# Portas do ambiente local

Este documento descreve as portas usadas localmente para o sistema.

## App SaaS

- Frontend React + Vite: `http://localhost:5173`
- Backend Node (Express): `http://localhost:4001`

## Site principal

- Site Next.js (`site/`): `http://localhost:3000` (porta padrao do `next dev`)

## Supabase local

- API URL / Project URL: `http://127.0.0.1:54321`
- REST API: `http://127.0.0.1:54321/rest/v1`
- GraphQL: `http://127.0.0.1:54321/graphql/v1`
- Edge Functions: `http://127.0.0.1:54321/functions/v1`
- Banco Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio (UI): `http://127.0.0.1:54323`
- Mailpit (caixa de emails local): `http://127.0.0.1:54324`

## Observações

- Em desenvolvimento, o frontend usa proxy `/api` para o backend local (`localhost:4001`).
- Em produção:
	- App SaaS: `https://app.saldoverde.pro`
	- API: `https://api.saldoverde.pro`
	- Site principal: `https://saldoverde.pro`
