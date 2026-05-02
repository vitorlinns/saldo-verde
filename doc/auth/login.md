# Login

## Objetivo

Documentar a implementação atual do fluxo de login em `saldo-verde`, incluindo a lógica do frontend e as integrações com o backend/Supabase.

## Arquivos principais

- Frontend:
  - `app/frontend/src/pages/login/login.tsx`
  - `app/frontend/src/lib/auth.ts`
- Backend:
  - `app/backend/src/routes/auth.ts`

## Visão geral do fluxo

A tela de login não faz autenticação por meio de um endpoint backend próprio. O processo de autenticação é executado diretamente via Supabase Auth no cliente frontend.

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
- `supabase.auth.signInWithPassword` para login com email e senha
- `supabase.auth.signInWithOAuth` para login via Google
- `useNavigate` do React Router para redirecionar após login

### Comportamento da página

- Campo de email e senha.
- Ação de login via botão `Entrar`.
- Link para recuperação de senha (`/recuperar-conta`).
- Botão de login com Google.
- Botão de login de usuário de teste que usa credenciais fixas.

### Regras de autenticação

- O login com email/senha chama `supabase.auth.signInWithPassword({ email, password })`.
- A validação de campos é feita no frontend de forma simples: email e senha devem ser informados.
- A tela exibe mensagens de erro retornadas pelo Supabase quando a autenticação falha.

### Test user

Há suporte explícito a um `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` definidos em `login.tsx`.

O fluxo é:

1. tenta criar o usuário com `supabase.auth.signUp(...)`
2. ignora o erro de "already registered"
3. autentica com `signInWithPassword`

Isso permite acesso rápido ao ambiente de teste sem pré-cadastro manual.

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

- `createClient()` — encapsula `createBrowserSupabaseClient()` do pacote `saldo-verde-supabase`.
- `isProfileComplete(session)` — determina se o usuário já completou todos os campos de perfil exigidos.

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

## Backend — `auth.ts`

### Rotas presentes

- `POST /register`

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

O `POST /register` existe apenas para o cadastro. O login em si não passa por essa rota.

## Observações importantes

- A autenticação de login é gerenciada no frontend pelo cliente Supabase.
- A página de login mantém a experiência de navegação por meio de hooks de sessão e redirecionamentos.
- A lógica de cadastro ainda reside no backend porque envolve validação de CPF, verificação de conta reservada e criação de usuários no Supabase Admin.

## Ajustes futuros

A documentação deve ser estendida para os outros fluxos de `auth`:

- registro (`register.md`)
- recuperação de senha (`recover.md`)
- perfil e sessão (`auth.md` geral)
