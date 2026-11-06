# Parcele Mais — Order Intake Front

Front do fluxo de pedido iniciado pelo WhatsApp do Parcele Mais / Cartão Simples. O backend envia um link `/intake/{token}`; a pessoa confirma o acesso por um código (SMS ou WhatsApp) e segue pelas etapas do pedido.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Design system `@twila-digital/components` + `@twila-digital/tokens` (tema `parcelemais`), Tailwind CSS v4
- TanStack Query, axios, React Hook Form + Zod, jotai
- Datadog RUM/Logs + feature flags (OpenFeature, provider Datadog)
- Biome, Husky, lint-staged, commitlint
- Vitest + Testing Library, Playwright

## Setup

Requisitos: Node 20.18+ (`.nvmrc`) e npm.

O projeto usa dois registries privados. O token do FontAwesome Pro fica no `.npmrc` do repositório (como nos outros fronts); o do GitHub Packages (`@twila-digital`) vai no seu `~/.npmrc`:

```ini
//npm.pkg.github.com/:_authToken=<PAT do GitHub com read:packages>
```

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

## Rodando localmente

Não há API falsa: o `npm run dev` fala com a API do ambiente configurado no `.env.local`:

- `API_URL`: host da API sem `/api/v1`.
- `INTAKE_HMAC_SECRET`: o segredo do mesmo ambiente (peça ao time de backend; fica no SSM).
- `NEXT_PUBLIC_WEBSOCKET_URL`: host do gateway para o WebSocket, sem `/api`.
- `NEXT_PUBLIC_PARCELEMAIS_URL`: site do Parcele Mais do ambiente (staging: `https://staging.parcelemais.com.br`; produção: `https://www.parcelemais.com.br`).

Para testar, abra `http://localhost:3000/intake/{token}` com o token de um link de intake gerado no ambiente.

## Scripts

| Script | O que faz |
| --- | --- |
| `dev` / `build` / `start` | Next.js |
| `lint` / `check` / `check:ci` / `format` | Biome |
| `test` / `test:watch` / `test:ui` | Vitest (`test` roda com cobertura) |
| `test:e2e` / `test:e2e:ui` | Playwright |
| `knip` | Arquivos, exports e dependências sem uso |

Hooks (Husky): `pre-commit` roda lint-staged, `commit-msg` valida Conventional Commits e `pre-push` roda `lint` + Vitest (sem cobertura).

## Estrutura

```
src/
  app/            rotas (page.tsx finas que só renderizam um módulo), route handlers
    api/intake/   BFF do intake (o browser nunca chama a API REST direto)
    intake/       /intake/[token] (entrada) e /intake/[token]/[etapa]
  common/         componentes, hooks, libs, utils, options, enums, records, stores compartilhados
  config/         Datadog e feature flags
  constants/      constantes compartilhadas
  domain/         tipos da API por entidade (<entidade>.domain.ts)
  modules/        código por feature: <feature>/index.tsx + components/ hooks/ schemas/ ...
  services/       camada HTTP (adapter axios, factory, http/<recurso>), react-query, providers
  tests/          setup do Vitest e helpers
  types/          tipos compartilhados
  env.ts          variáveis de ambiente validadas (t3-env)
  proxy.ts        middleware (manutenção)
e2e/              Playwright (specs/, pom/)
terraform/        infraestrutura do Amplify
```

## Adicionando uma variável de ambiente

1. Declare em `src/env.ts` (`server` ou `client`, e em `runtimeEnv`).
2. Adicione em `.env.example`.
3. E2E: valor real no secret `E2E_DOTENV` + nome em `e2e/.env.secret-keys`, **ou** placeholder em `e2e/.env.ci`.
4. Deploy: valor público em `terraform/config/{staging,production}/terraform.tfvars`, **ou** secreto no array `SECRETS` do `amplify.yml` + parâmetro no SSM.

O teste `src/env-e2e-coverage.test.ts` falha se algum desses passos for esquecido.

## Manutenção

Com `NEXT_PUBLIC_IN_MAINTENANCE=true`, todas as rotas redirecionam para `/manutencao`.

## Deploy

AWS Amplify, com o workflow reutilizável `twila-front-pipelines` (`.github/workflows/`). O `amplify.yml` lê o `PACKAGES_TOKEN` do SSM antes do `npm ci`; o token do FontAwesome vem do `.npmrc`.

> A infra do Parcele Mais (apps Amplify, domínios, `terraform.tfvars`, Datadog) fica em tarefa própria.

## Contrato das etapas

Fonte: `swagger.json` (endpoints `/v1/intake/*`) e respostas do backend para os campos que o swagger tipa como `string`.

O `GET intake/start` devolve `orderId`, `order { status, externalStatus }` e `dateAndStatus`, que sempre traz as 6 etapas, nesta ordem:

| Etapa | Status | Rota | Path no BFF | API |
| --- | --- | --- | --- | --- |
| Dados pessoais (com o consentimento da consulta de crédito) | `UpdateProfile` | `dados-pessoais` | `personal-data` | `PUT intake/profile` |
| Endereço | `UpsertAddress` | `endereco-cobranca` | `address` | `PUT intake/address` |
| Parcelas | `UpdateTerm` | `parcelas` | `installments` | — |
| Cartão | `PaymentProfile` | `cartao` | `credit-card` | `POST intake/payment-profile` |
| Biometria | `Biometry` | `biometria` | `biometrics` | `GET intake/biometry` |
| Compra | `StartSale` | sem tela (vai para `pedido-concluido`) | `purchase` | `POST intake/sale` |

O `order.status` decide as telas fora das etapas:

| Situação | `order.status` | Start | Tela |
| --- | --- | --- | --- |
| Antes da análise | `SaleNotStarted`, `WaitingRegistration`, `PendingAuthorization` | 200 | etapa ativa |
| Análise | `Analysing` | 200 | `analise-credito` (depois dos dados pessoais) |
| Aprovado | `Approved` | 200 | `credito-aprovado` (depois dos dados pessoais) |
| Aprovado | `PendingPayment` | 200 | etapa ativa |
| Pagamento recusado | `PaymentRefused` | 200 | etapa ativa |
| Compra disparada | `PendingPaymentConfirmation` | 200 | `pedido-concluido` |
| Recusado | `NotAuthorized`, `UnavailableBalance`, `AnalysisExpired`, `BiometryRefused` | 410 | link encerrado |
| Cancelado | `Canceled` | 410 | link encerrado |
| Concluído | `Purchased`, `Billing`, `Done`, `Frozen`, `Disbursed` | 410 | link encerrado |

Erros vêm como ProblemDetails com o código em `type` (ex.: `Intake.InviteClosed`); em validação, `type` é `ValidationError` e os códigos ficam em `errors[]` (`code`, `message`). Em todas as rotas com convite: 404 `Intake.InviteNotFound` e 410 `Intake.InviteClosed`; nas rotas com o Bearer do verify-code: 403 `Intake.TokenPhoneMismatch`.

## Pendências com backend/produto

- **Telas de crédito negado e pedido cancelado:** o start responde 410 (`Intake.InviteClosed`) para recusado, cancelado e concluído, sem dizer qual. O front cai em "Esse pedido foi encerrado" e as telas `credito-negado` e `pedido-cancelado` (Figma 1.2.1 e 1.7.1) não aparecem. Precisa de um `type` por motivo no 410 (ou 200 com o status).
- **`Approved` x `PendingPayment`:** o front assume que `Approved` é "a loja vai iniciar sua compra" e que, quando a loja inicia, o pedido vai para `PendingPayment` e segue pelas etapas. Confirmar.
- **`PUT intake/profile`:** a API cobra `Idempotency-Key` (`Request.IdempotencyKeyRequired`) e o IP da decisão (`Customer.DecisionIpIsRequired`), que não estão no swagger. Como a chamada sai do servidor do front, falta combinar como o IP do cliente chega.
- **Parcelas:** não há endpoint de intake para simular e escolher as parcelas (só `orders/simulate` e `orders/term`, fora do intake).
- **Compra:** `POST intake/sale` exige `Idempotency-Key`; falta definir quando o front chama (ao fim da biometria?).
- **Biometria:** `RETRIED` (reprovada e reprocessada) tem um bug conhecido do lado do backend.
- **Tempo real:** o hub do SignalR não está no swagger. O front espera `ProposalStatusChanged` (com `data.status` = status do pedido) e `orderId` no evento; confirmar os nomes.
- **Link mágico:** `intake/access` (rota `?acesso=`) não aparece no swagger.
- **Senha** em `PUT intake/profile`: a API exige, mas a tela 1.2 do Figma não tem campo de senha.
- **Dados pessoais (Figma 1.2):** a tela tem Nome e Sobrenome (a API tem só `name`), CPF (a API usa o do convite) e Telefone desabilitado (o start não devolve).
- **Crédito negado (Figma 1.2.1):** o título no Figma é "Tudo certo!"; confirmar com produto.
