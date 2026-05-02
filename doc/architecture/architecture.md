# Arquitetura Geral do SaaS

## Visão geral

A solução `saldo-verde` é organizada como um monorepo com camadas separadas para backend, frontend e site público.
O propósito é manter o backend do SaaS isolado em `app/backend/`, o frontend de gestão em `app/frontend/` e o site institucional em `site/`.

## Estrutura do repositório

- `app/backend/`
  - API do SaaS
  - Servidor Express
  - Integração com Supabase via `SUPABASE_SERVICE_ROLE_KEY`
  - Lógica de autenticação, cadastro, perfil, notificações e exclusão de conta
  - Rotas modulares em `src/routes/`
  - Helpers em `src/lib/`

- `app/frontend/`
  - Aplicação React + Vite
  - Rotas de página em `src/pages/`
  - Componentes reutilizáveis em `src/components/`
  - Lógica de autenticação cliente em `src/lib/auth.ts`

- `app/supabase/`
  - Configuração de cliente Supabase e tipagens de ambiente

- `site/`
  - Site público/marketing separado da aplicação SaaS
  - Conteúdo estático e páginas informativas

## Backend

### Padrão de organização

O backend foi refatorado para se apoiar em módulos claros:

- `src/index.ts`: orquestra inicialização do servidor e registro de rotas
- `src/routes/`: contém os endpoints Express organizados por domínio
- `src/lib/`: contém utilitários e lógica compartilhada

### Principais domínios

- `routes/auth.ts`
  - cadastro de usuários via Supabase Admin API
  - validações de email, senha, CPF e idade
  - verificação de contas reservadas em `deleted_accounts`

- `routes/notifications.ts`
  - entrega de notificações para o usuário autenticado
  - depende de token Bearer válido e Supabase Auth

- `routes/account.ts`
  - exclusão de conta do usuário autenticado
  - reserva de email/CPF em `deleted_accounts`

- `routes/profile.ts`
  - consulta e atualização de perfil do usuário
  - validações de CPF, telefone, CEP, endereço e nascimento

- `routes/site.ts`
  - ativos públicos e configuração de footer
  - serve logo e metadados do site

- `routes/health.ts`
  - healthcheck básico do serviço

### Autenticação e segurança

- O backend usa `SUPABASE_SERVICE_ROLE_KEY` para operações administrativas no Supabase.
- O frontend faz login diretamente com o cliente Supabase, sem proxy de login via backend.
- Rotas protegidas no backend dependem da validação de token Bearer e usuário autenticado.
- O middleware global aplica limites de taxa via `src/lib/rate-limiter.ts`.

### Fluxo de dados

- Cadastro: `frontend -> POST /register -> backend -> Supabase Admin`
- Notificações: `frontend -> GET /notifications -> backend -> Supabase / mensagem gerada em lib`
- Perfil: `frontend -> GET/PUT /profile/:id -> backend -> Supabase`
- Exclusão: `frontend -> DELETE /account/:id -> backend -> Supabase Admin`

## Frontend

### Arquitetura de páginas

O frontend é uma aplicação SPA gerenciada por React Router.
A navegação e as páginas principais estão em `app/frontend/src/pages/`.

### Organização de componentes

- `components/` contém UI atômica e elementos reutilizáveis
- `appbar/`, `sidebar/`, `cards/`, `modal/`, `btn/` são exemplos de agrupamento por responsabilidade
- `lib/auth.ts` concentra o cliente Supabase e checagem de perfil completo

### Autenticação

O login é realizado diretamente com Supabase Auth no cliente:

- `supabase.auth.signInWithPassword(...)`
- `supabase.auth.signInWithOAuth(...)`

A página de login observa o estado de sessão e redireciona para o destino apropriado:
- `/dashboard` se o perfil estiver completo
- `/perfil` caso contrário

### Sessão e perfil

A aplicação usa `session.user.user_metadata` para armazenar dados de perfil e determinar se o usuário completou o cadastro.
O usuário não deve acessar rotas restritas até que o perfil esteja completo.

### Notificações

- A interface de notificações tem página própria e dropdown no AppBar.
- O dropdown exibe até 4 notificações recentes.
- A página de notificações exibe toda a lista e permite visualização detalhada.

## Integração Supabase

### Backend

- Uso de `createClient` com `SUPABASE_SERVICE_ROLE_KEY` para operações administrativas.
- Leitura/escrita em tabelas protegidas como `deleted_accounts` e `auth.users`.

### Frontend

- Uso de `createBrowserSupabaseClient()` para autenticação e sessão do usuário.
- Cliente frontend consome o backend apenas onde necessário (cadastro, conteúdo de site, notificações, perfil).

## Ambiente e variáveis

Variáveis relevantes:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_ORIGIN`
- `VITE_BACKEND_URL`

## Observações de arquitetura

- O backend foi organizado por domínio em vez de agrupar lógica no `index.ts`.
- A separação entre API do SaaS e site público permite evolução independente.
- A camada de frontend permanece responsável pela UX de login e sessão, enquanto o backend trata regras de criação e dados sensíveis.

## Direções futuras

- Estender o backend com rotas reais de recuperação de senha e assinatura.
- Adicionar contratos de API mais explícitos e documentação de rotas.
- Garantir que a camada `site/` continue isolada do SaaS core.
