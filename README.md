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

## Pendências com backend/produto

### Contrato das etapas (fonte: `swagger.json`, endpoints `/v1/intake/*`)

O `GET intake/start` devolve `orderId`, `order { status, externalStatus }` e `dateAndStatus`, com as etapas: dados pessoais (com o consentimento da consulta de crédito), endereço, parcelas, cartão, biometria e compra. O swagger **não lista os nomes dos status** (`activeStatus` e `steps[].status` são `string`), então os de `IntakeStepStatus` ainda são **provisórios**:

| Etapa | Status provisório | Rota | Path no BFF | API |
| --- | --- | --- | --- | --- |
| Dados pessoais | `IncludePersonalData` | `dados-pessoais` | `personal-data` | `PUT intake/profile` |
| Endereço | `IncludeAddress` | `endereco-cobranca` | `address` | `PUT intake/address` |
| Parcelas | `ChooseInstallments` | `parcelas` | `installments` | — |
| Cartão | `IncludeCreditCard` | `cartao` | `credit-card` | `POST intake/payment-profile` |
| Biometria | `AnalyseBiometric` | `biometria` | `biometrics` | `GET intake/biometry` |
| Compra | `Purchase` | sem tela (vai para `pedido-concluido`) | `purchase` | `POST intake/sale` |

- **Nomes dos status** das etapas: confirmar com o backend.
- **Parcelas:** não há endpoint de intake para simular e escolher as parcelas (só `orders/simulate` e `orders/term`, fora do intake).
- **Compra:** `POST intake/sale` exige o header `Idempotency-Key`; falta definir quando o front chama (ao fim da biometria?) e o BFF ainda não envia.
- **Análise de crédito e telas finais** saem de `order.status` (mesmos valores do `OrderStatus` do backoffice do CS), depois dos dados pessoais: `Analysing` → `analise-credito`, `Approved` → `credito-aprovado` (Figma: "a loja vai iniciar sua compra"), `Canceled` → `pedido-cancelado`, `UnavailableBalance`/`NotAuthorized`/`AnalysisExpired` → `credito-negado`. Confirmar os status de recusa e qual status indica que a loja iniciou a compra (o front assume que o pedido deixa de ser `Approved` e segue pelo `activeStatus`).
- **Tempo real:** o hub do SignalR não está no swagger. O front ainda espera `ProposalStatusChanged` (com `data.status` = status do pedido) e `orderId` no evento; confirmar os nomes.
- **Link mágico:** `intake/access` (rota `?acesso=`) não aparece no swagger.
- **Senha** em `PUT intake/profile`: a API exige, mas a tela 1.2 do Figma não tem campo de senha. O BFF só exige que venha preenchida.
- **Dados pessoais (Figma 1.2):** a tela tem Nome e Sobrenome (a API tem só `name`), CPF (a API usa o do convite) e Telefone desabilitado (o start não devolve). Confirmar com o backend.
- **Crédito negado (Figma 1.2.1):** o título no Figma é "Tudo certo!"; confirmar com produto.
