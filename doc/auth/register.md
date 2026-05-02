# Registro

## Objetivo

Documentar o fluxo de criação de conta em `saldo-verde`, com foco no frontend de cadastro, validações locais e a rota backend responsável pela criação de usuário no Supabase.

## Arquivos principais

- Frontend:
  - `app/frontend/src/pages/login/register.tsx`
- Backend:
  - `app/backend/src/routes/auth.ts`

## Frontend — `register.tsx`

### Cenário

O formulário de cadastro coleta:

- Email
- CPF
- Data de nascimento
- Senha
- Confirmação de senha

A ação principal do formulário envia esses dados para o backend via `POST ${BACKEND_URL}/register`.

### Validação local antes do envio

O frontend valida os campos de forma rígida:

- todos os campos devem ser preenchidos
- email deve seguir um formato válido
- CPF deve ter exatamente 11 dígitos numéricos
- data de nascimento deve formar uma data válida
- o usuário deve ter 18 anos ou mais
- senha deve ter ao menos 8 caracteres
- senha e confirmação devem ser iguais

### Regras de formato

O CPF é tratado como string e apenas dígitos são considerados. A data de nascimento é formatada automaticamente para `DD/MM/YYYY` durante a digitação.

### Comportamento de submissão

1. O componente faz `fetch` para `${BACKEND_URL}/register`.
2. Envia `Content-Type: application/json`.
3. O corpo contém
   - `email`
   - `password`
   - `cpf`
   - `birthdate`
4. O frontend exibe o `message` ou `error` retornado pelo backend.
5. Em caso de sucesso, a página aguarda 2.5s e redireciona o usuário para `/login`.

### Experiência do usuário

- Mensagens de sucesso são exibidas com `SuccessMessage`.
- Erros são exibidos com `ErrorMessage`.
- A página também exibe links para políticas e termos.

## Backend — `auth.ts` (rota `/register`)

### Responsabilidade

Esta rota valida os dados recebidos e cria o usuário no Supabase via Admin API.

### Validações do backend

O backend repete e fortalece parte das validações do frontend:

- `email` existe e tem formato válido
- `password` existe e tem ao menos 8 caracteres
- `cpf` existe e é validado com o algoritmo de CPF
- `birthdate` existe e é convertido para data válida
- usuário tem 18 anos ou mais

### Verificações de conflito

Antes de criar o usuário, o backend valida:

- se já existe registro na tabela `deleted_accounts` para o mesmo email ou CPF
- se já existe usuário em `auth.users` com o mesmo email
- se já existe usuário em `auth.users` com o mesmo CPF em `user_metadata->>cpf`

### Criação do usuário

A criação é feita com `supabase.auth.admin.createUser(...)`, incluindo:

- `email`
- `password`
- `email_confirm: false`
- `user_metadata` com `cpf` e `birthdate`

### Respostas

- `201` com `{ user, message }` em sucesso
- `400`, `409` ou `500` com `{ error }` em falha

### Observações

- A rota `/register` não faz login automático.
- A autenticação posterior é feita pelo frontend com Supabase Auth.
- O backend protege contra reutilização de CPF/email já existentes ou reservados.
