# Recuperação de conta

## Objetivo

Documentar o fluxo atual de recuperação de conta em `saldo-verde`, incluindo o caminho de telas existentes, validações e o estado atual da integração backend.

## Arquivos principais

- `app/frontend/src/pages/login/recover.tsx`
- `app/frontend/src/pages/login/code.tsx`
- `app/frontend/src/pages/login/password.tsx`

## Visão geral do fluxo

O fluxo de recuperação está organizado em três telas:

1. `/recuperar-conta` — tela de envio de email para recuperação
2. `/recuperar-conta/codigo` — tela de inserção do código de verificação
3. `/recuperar-conta/nova-senha` — tela de criação de nova senha

### Estado atual

O fluxo de recuperação agora conta com backend e frontend integrados.
O backend envia o código de recuperação via Resend e expõe os seguintes endpoints:

- `POST /recover/request` — solicita envio de código para o email informado
- `POST /recover/verify` — valida o código recebido pelo usuário
- `POST /recover/reset` — redefine a senha após verificação do código

O remetente padrão do email de recuperação é `no-reply@saldoverde.pro`.

### Configuração do backend

A chave da API do Resend deve ser configurada no backend via variável de ambiente:

- `RESEND_API_KEY`
- opcionalmente `RESEND_FROM_EMAIL` para sobrescrever o remetente

No código atual, o backend lê `RESEND_API_KEY` em `app/backend/src/lib/email.ts`.

## Tela 1 — `RecoverPage`

### Arquivo

- `app/frontend/src/pages/login/recover.tsx`

### Comportamento

- O usuário preenche o email cadastrado.
- O formulário valida apenas que o campo não está vazio.
- Ao submeter, a página chama `POST /recover/request`.
- A API responde com uma mensagem genérica e envia um código por email quando o email existe.
- Em seguida, a página redireciona para `/recuperar-conta/codigo`.

### Limitações

- A página ainda não valida se o email é realmente cadastrado antes de enviar a solicitação.
- A mensagem de resposta é genérica por segurança.

## Tela 2 — `CodePage`

### Arquivo

- `app/frontend/src/pages/login/code.tsx`

### Comportamento

- O usuário informa um código de 6 dígitos.
- Os campos aceitam apenas números e avançam automaticamente para o próximo dígito.
- Ao submeter, a página valida que todos os 6 dígitos foram preenchidos.
- Se válido, faz espera simulada de 2 segundos e redireciona para `/recuperar-conta/nova-senha`.

### Limitações

- O código é gerado e verificado pelo backend, mas o fluxo ainda depende do frontend para navegação de telas.
- O código expira em 15 minutos.

## Tela 3 — `PasswordPage`

### Arquivo

- `app/frontend/src/pages/login/password.tsx`

### Comportamento

- O usuário informa senha e confirmação de senha.
- Validações locais:
  - ambos os campos devem estar preenchidos
  - senha deve ter ao menos 8 caracteres
  - senha e confirmação devem coincidir
- Em seguida, simula processamento de 2 segundos.
- Exibe mensagem de sucesso e redireciona para `/login`.

### Limitações

- Ainda não há integração com backend para atualizar a senha real do usuário.
- Não há uso de token de recuperação, sessão temporária ou validação do usuário dono da conta.

## Conclusão técnica

O fluxo atual é uma implementação de experiência de front-end que modela a navegação esperada, mas não realiza a recuperação de conta de verdade.

### Pontos a serem completados em backend

- envio de email de recuperação com token/código
- validação do código/token recebido
- atualização segura da senha no provedor de autenticação
- expiração de token de recuperação

### Observação de documentação

Esta documentação descreve o estado atual do sistema, não um fluxo de recuperação completo implementado.
