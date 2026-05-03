# Login

## Objetivo

Documentar a implementação atual do fluxo de login em `saldo-verde`, incluindo a lógica do frontend e as integrações com o backend/Supabase.

## Arquivos principais

- Frontend:
  - `app/frontend/src/pages/login/login.tsx`
  - `app/frontend/src/lib/auth.ts`
- Backend:
  - `app/backend/api/auth/login.ts`
  - `app/backend/api/auth/refresh.ts`
  - `app/backend/api/auth/me.ts`
  - `app/backend/api/auth/logout.ts`
  - `app/backend/api/auth/_cookies.ts`
  - `app/backend/api/logout.ts`
  - `app/backend/api/_auth.ts`
  - `app/backend/src/routes/auth.ts`

## Visão geral do fluxo

A tela de login autentica via endpoint backend próprio (`POST /api/auth/login`).

O backend valida credenciais no Supabase e retorna a sessão para o frontend, além de definir cookies `httpOnly` para reforçar o controle de sessão (`sv_at` e `sv_rt`).

Quando o usuário acessa a página de login:

1. O cliente Supabase é inicializado com `createClient()` em `app/frontend/src/lib/auth.ts`.
2. O app valida se já existe uma sessão ativa chamando `supabase.auth.getSession()`.
3. Se já houver sessão válida, o usuário é redirecionado para:
   - `/dashboard` quando o perfil está completo
   - `/perfil` quando o perfil ainda não está completo
4. Um listener `supabase.auth.onAuthStateChange` também mantém o redirecionamento reativo a mudanças de sessão.

## Frontend — `login.tsx`

### Dependências principais

- `createClient` de `app/frontend/src/lib/auth.ts`
- `fetch(POST /api/auth/login)` para login com email e senha
- `supabase.auth.setSession(...)` para manter compatibilidade com o fluxo atual do app
- `supabase.auth.signInWithOAuth` para login via Google
- `useNavigate` do React Router para redirecionar após login

### Comportamento da página

- Campo de email e senha.
- Ação de login via botão `Entrar`.
- Link para recuperação de senha (`/recuperar-conta`).
- Botão de login com Google.

### Regras de autenticação

- O login com email/senha chama `POST /api/auth/login`.
- Em sucesso, o frontend recebe `session` e chama `supabase.auth.setSession(session)`.
- O frontend valida:
  - Email e senha não podem estar em branco.
  - O e-mail precisa ter formato válido (regex `EMAIL_REGEX`) antes de qualquer chamada à API.
- Mensagens de erro retornadas pelo backend são normalizadas por `normalizeAuthError()` antes de exibição — erros internos nunca chegam ao usuário.

### Proteção contra brute force (throttle de frontend)

Após `MAX_ATTEMPTS` (3) tentativas de login mal-sucedidas consecutivas, a tela entra em bloqueio progressivo, persistido em `localStorage` (`saldo-verde:login-throttle`):

- 1º bloqueio: 60 segundos
- 2º bloqueio: 5 minutos
- 3º+ bloqueios: 15 minutos

Durante o bloqueio:

- O botão de login fica desabilitado e exibe contador regressivo.
- O estado de bloqueio sobrevive a recarregamento de página.
- Após login bem-sucedido, o estado de bloqueio é limpo.

> Nota: além do throttle de frontend, o backend aplica rate limit dedicado por `ip + email` em `/api/auth/login`.

### Test user

Removido. As credenciais de teste (`TEST_USER_EMAIL` / `TEST_USER_PASSWORD`) foram eliminadas do bundle de produção para evitar exposição de segredos no código-fonte. Acesso de teste deve ser feito diretamente no painel do Supabase.

### Login com Google

O botão de Google dispara `supabase.auth.signInWithOAuth({ provider: 'google' })`.

O frontend espera o retorno do Supabase e exibe mensagem de redirecionamento.

### Redirecionamento pós-login

Após autenticação bem-sucedida, o fluxo de redirecionamento é o mesmo do inicial:

- perfil completo: `/dashboard`
- perfil incompleto: `/perfil`

O estado de sessão é observado no hook `useEffect` com `onAuthStateChange`.

## Frontend — `auth.ts`

### Funções auxiliares

- `createClient()` — inicializa o cliente Supabase como singleton (uma única instância reutilizada em todo o frontend). Lança erro se `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` estiverem ausentes, e impede o uso acidental da service role key no browser.
- `signOutWithBackend(supabase)` — executa logout em duas etapas:
  1. Obtém o `access_token` (JWT) da sessão ativa.
  2. Envia `POST /api/logout` com `Authorization: Bearer <token>` para que o backend invalide a sessão server-side.
  3. Chama `supabase.auth.signOut()` para limpar o estado local.
- `isProfileComplete(session)` — determina se o usuário já completou todos os campos de perfil exigidos.
- `isGoogleSession(session)` — detecta se a sessão foi criada via OAuth do Google.

### Critério de perfil completo

O perfil é considerado completo quando a sessão contém `user_metadata` com todos os campos:

- `first_name`
- `last_name`
- `cpf`
- `phone`
- `birthdate`
- `cep`
- `street`
- `number`
- `complement`
- `neighborhood`
- `city`
- `state`

Essa checagem é usada para decidir se o usuário segue para `/dashboard` ou permanece em `/perfil`.

## Backend — `logout.ts`

### `POST /api/logout`

Endpoint chamado por `signOutWithBackend()` imediatamente antes do `signOut` local.

Fluxo:

1. Extrai o JWT do header `Authorization: Bearer <token>` via `getBearerToken()`.
2. Verifica o usuário correspondente com `supabase.auth.getUser(token)` (Supabase Admin).
3. Se o usuário existir, chama `supabase.auth.admin.signOut(userId)` para invalidar a sessão server-side (revoção de refresh token).
4. Retorna `200` independentemente — erros de admin signOut são apenas logados, não bloqueiam o fluxo.

> O token enviado é o `access_token` JWT da sessão Supabase. Se não for enviado (ex.: sessão já expirada), o endpoint retorna sucesso sem ação server-side.

## Backend — `auth.ts`

### Rotas presentes

- `POST /register`
- `POST /login`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`
- `POST /auth/logout`

### Escopo de `register`

A rota de cadastro valida e cria usuário via Supabase Admin API.

Regras de validação:

- `email` deve estar presente e ter formato válido
- `password` deve ter ao menos 8 caracteres
- `cpf` deve existir e ser válido via algoritmo de CPF
- `birthdate` deve existir e ser uma data válida no formato `DD/MM/AAAA`
- usuário deve ser maior de 18 anos
- não pode haver reserva de conta na tabela `deleted_accounts` para mesmo email ou CPF
- email não pode estar cadastrado no `auth.users`
- CPF não pode estar cadastrado no `auth.users` em `user_metadata->>cpf`

Após validação, a conta é criada com `supabase.auth.admin.createUser(...)` e o retorno inclui o objeto `user` do Supabase.

### Importante

- `POST /register` existe apenas para cadastro.
- O login profissional passa por `/api/auth/login`.
- `/api/auth/refresh` renova sessão a partir do refresh token em cookie `httpOnly`.
- `/api/auth/me` valida sessão a partir do access token (Bearer ou cookie `sv_at`).

## Observações importantes

- A autenticação de login é centralizada no backend (`/api/auth/login`), com retorno de sessão para compatibilidade do cliente atual.
- O cliente Supabase é instanciado como singleton via `createClient()` — não deve ser armazenado em estado React.
- O logout é composto: invalidação server-side via Admin API + limpeza de estado local.
- Mensagens de erro do Supabase (em inglês / com detalhes internos) nunca chegam diretamente ao usuário.
- A lógica de cadastro permanece no backend pois envolve validação de CPF, verificação de conta reservada e criação via Supabase Admin API.

## Ajustes futuros

A documentação deve ser estendida para os outros fluxos de `auth`:

- registro (`register.md`)
- recuperação de senha (`recover.md`)
- perfil e sessão (`auth.md` geral)
