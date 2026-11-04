# Credicarro — Proposal Intake Front

Front do fluxo de proposta iniciado pelo WhatsApp. O backend envia um link `/intake/{token}`; a pessoa escolhe receber um código por SMS ou WhatsApp (vai para o celular cadastrado na proposta, sem digitar o número) e, a cada nova mensagem no WhatsApp, volta pelo mesmo link para fazer a etapa da vez.

Design (Figma — C2C WhatsApp): [comprador](https://www.figma.com/design/b4vmVXpQPir58ZJRvHdc7w/C2C----Whatsapp?node-id=4204-59113&m=dev) · [vendedor](https://www.figma.com/design/b4vmVXpQPir58ZJRvHdc7w/C2C----Whatsapp?node-id=9005-7360&m=dev) · [contraproposta](https://www.figma.com/design/b4vmVXpQPir58ZJRvHdc7w/C2C----Whatsapp?node-id=9116-8634&m=dev)

> **Estado atual:** integrado aos endpoints de intake (`/api/v1/intake/*`) conforme o guia do backend CAR-1879. O que ainda depende do backend ou de produto está em [Pendências](#pendências-com-backendproduto).

## Fluxo

1. `/intake/[token]` (Server Component) chama o `start` no servidor e decide:
   - com `?acesso={codigo}` (entrada pelo C2C, em "Minhas propostas") → antes do `start`, redireciona para `GET /api/intake/[token]/access`, que troca o código de uso único pela sessão (sobrescrevendo o cookie, se houver) e volta para o link. Código inválido, vencido ou já usado volta sem sessão, ou seja, para a verificação;
   - sem cookie de acesso → verificação (canal SMS/WhatsApp → código → etapa ativa);
   - com cookie → redireciona pela `getIntakeEntryRoute` (`src/common/records/intake-step-route.record.ts`): comprador com `proposal.status` `InNegotiation` → `/novas-condicoes`; `Analysing` (ou o vendedor em `InNegotiation`) → `/proposta-em-analise`; nos demais, a etapa do `activeStatus`;
   - `activeStatus` nulo → `/proposta-finalizada`; `dateAndStatus` nulo em outro status → `/etapa-indisponivel`.
2. `404` do start → "Link inválido ou expirado"; `410` → "Essa proposta foi encerrada" (5.1, com o botão "Falar com o suporte" para o WhatsApp da Credicarro, `constants/app-info.ts`, também com white label).
3. O layout do token aplica o whitelabel do `start` (cores, raios, fontes e logo) com `@twila-digital/components/white-label`.

## Chamadas à API

Contrato: guia do backend **CAR-1879 — Guia de implementação do intake (frontend)** e **CAR-1879 — Intake em tempo real (SignalR)**. **O browser nunca chama a API REST** (só o WebSocket, abaixo):

- O browser chama o BFF em `src/app/api/intake/[token]/*` (via `services/http/intake`).
- O BFF chama a API com `intakeServerFetch` (`src/services/http/intake/server/intake-server-fetch.ts`): path relativo a `/api/v1`, token do link no header `X-Intake-Token`.
- **HMAC** (`start`, `send-code`, `verify-code`, `access/redeem`, em `src/common/lib/hmac.ts`): `X-Timestamp`, `X-Nonce` (UUID novo por chamada) e `X-Signature = hex(HMAC-SHA256(INTAKE_HMAC_SECRET, timestamp\nnonce\nMÉTODO\n/api/v1/...\ntoken\n + body))`. Qualquer erro na assinatura vira `401` do gateway, sem corpo.
- **Bearer** (rotas de etapa): o `accessToken` do `verify-code` fica em cookie httpOnly (um por link, `server/intake-session.ts`). Um `401`/`403` nessas rotas apaga o cookie e o BFF responde `Intake.SessionExpired`; o client recarrega e a pessoa volta para a verificação.

| BFF (`/api/intake/[token]/...`) | API (`/api/v1/...`) |
| --- | --- |
| `GET start` | `GET intake/start` |
| `POST send-token` | `POST intake/send-code` (`channel`: `sms` ou `wpp`, os mesmos valores do botão) |
| `POST verify-token` | `POST intake/verify-code` |
| `GET access?code=` | `POST intake/access/redeem` (código do C2C; responde `303` para o link, com ou sem sessão) |
| `GET steps/{path}` | dados da tela: `intake/banks` (Dados bancários, só HMAC), `intake/documents/required` (Documentos, com as pendências da etapa no start) e `intake/biometry` (Biometria) |
| `GET proposal` | `GET intake/proposal` (card do cabeçalho) |
| `POST new-conditions/decision` | `POST intake/decision-counter-proposal` (`simulationId`, `isAccepted`) |
| `POST steps/{path}` | traduzido em `server/submit-intake-step.ts`: `notify-seller`, `deposit-account`, `vehicle-detail`, `account`, `decision-seller`, `establishment-details` |
| `POST documentos/upload-url` | `POST intake/documents/upload-url` |
| `POST documentos` | `POST intake/documents` |
| `POST realtime/ticket` | `POST intake/realtime/ticket` (devolve o ticket e o `accessToken` para o WebSocket) |

| Etapa (`activeStatus`) | Rota | Tela |
| --- | --- | --- |
| `CreateAccount` | `/dados-pessoais` | 1.2.1 Dados pessoais (vendedor PF) |
| `DecisionSeller` | `/confirmar-vendedor` | 8.x Você é o vendedor? |
| `NotifySeller` | `/dados-vendedor` | Dados do vendedor (comprador C2C) |
| `IncludeDepositAccount` | `/dados-bancarios` | Dados bancários + titular |
| `IncludeDocument` | `/documentos` | Documentos |
| `IncludeVehicleExtraInformation` | `/dados-complementares` | Dados do veículo |
| `InspectCar` | `/vistoria` | 5.0 Realize a vistoria (informativa; o link do parceiro chega pelo WhatsApp) |
| `IncludeEstablishmentDetails` | `/dados-empresa` | 3.3 Dados da empresa (lojista) |
| `AnalyseBiometric` | `/biometria` | Iframe da Didit (consulta a cada 5s só sem WebSocket) |
| `Payment`, `Finished` ou `null` | `/proposta-finalizada` | Conclusão do fluxo |
| proposta `InNegotiation` (comprador) | `/novas-condicoes` | 2.0 Novas condições de proposta |
| proposta `Analysing` (comprador) | `/proposta-em-analise` | 2.1 Novas condições aceitas |
| proposta `InNegotiation` ou `Analysing` (vendedor) | `/proposta-em-analise` | Proposta em análise (sem Figma) |

**Documentos.** A lista e o status vêm do `GET intake/documents/required`: cada requisito vira uma linha e suas alternativas (ex.: CNH, CNH Digital ou CPF e RG) viram abas no modal, com um campo de arquivo por documento (`src/common/utils/get-intake-documents.ts`). O motivo da recusa vem das `pendencies` da etapa no start. Cada arquivo: `upload-url` → POST multipart no S3 (os `fields` e por último `file`) → `documents`, com o `documentType` que a própria API devolve; depois a lista é recarregada. A etapa conclui sozinha no backend quando `isComplete`.

**Tempo real (SignalR).** Depois da verificação, o layout do link monta `IntakeRealtimeProvider` (uma conexão por aba). O BFF pede o ticket (`POST realtime/ticket`, uso único, 60s) e devolve junto o `accessToken`, que o gateway exige na URL do hub: é a **única** rota que entrega o token ao browser. O browser conecta direto em `NEXT_PUBLIC_WEBSOCKET_URL` + `/api/signalr/intake/hub`, só WebSocket e sem `negotiate` (`intake-realtime-client.ts`). Sem `withAutomaticReconnect` (reusaria o ticket gasto): a reconexão é manual, com ticket novo e backoff de 1s, 2s, 5s, 10s e depois 30s. Ticket `401`/`403` volta para a verificação; `404`/`410` mostra o aviso do link. Mensagens `IntakeUpdated`:

- `ActiveStatusChanged`: navega para a etapa ativa (na mesma tela, só recarrega).
- `BiometryStatusChanged`: consulta o `biometry` de novo (inclusive a sessão nova da Didit quando expira).
- `DocumentStatusChanged`: toast com o documento recusado e o motivo, e recarrega.
- `ProposalStatusChanged` com `InNegotiation`, `Analysing` ou `Approved`: consulta o start e vai para a tela do novo status (contraproposta, em análise ou etapas).
- `ProposalStatusChanged` com outro status (`Refused`, `Canceled`, `Expired`, `Completed`): encerra a conexão e recarrega; o start dá `410` e o layout mostra a proposta encerrada.

Mensagens repetidas ou mais antigas (`occurredAt`) são descartadas. Ao conectar ou reconectar, o start é consultado de novo. **Plano B:** enquanto desconectado, o start a cada 20s e, com a Didit aberta, o `biometry` a cada 5s.

**Contraproposta (CAR-1955).** Com a proposta em `InNegotiation`, o start vem com `dateAndStatus: null` e o comprador vai para `/novas-condicoes` (sempre depois da verificação). A tela carrega no servidor o `intake/new-conditions` e o `intake/proposal` (card "Proposta enviada") e mostra só as condições em `InNegotiation`, uma por chip de prazo, ordenadas pelo `term`; sem chips quando há uma só. "Detalhes das parcelas" abre o modal de CET da condição escolhida. Aceitar ou recusar envia a condição do chip escolhido e mostra na hora a 2.1 (aceitas) ou a 2.2 (recusadas): a troca de status no backend é assíncrona, e o `ProposalStatusChanged` (ou o polling sem conexão) leva para a tela seguinte. Recusar encerra a proposta (`Refused`). Sem condição pendente, vale a última decisão da lista: `Refused` mostra a 2.2 e `Accepted` mostra a 2.1. Lista vazia (condições ainda sendo geradas) mostra o volante e recarrega a cada 5s por até 1 minuto; depois, "Continue pelo WhatsApp". Os `409` (`ProposalNotInNegotiation`, `CounterProposalAlreadyDecided`, `CounterProposalNotFound`) e o `410` recarregam a tela. O vendedor em `InNegotiation` ou `Analysing` vê "Proposta em análise" e não chama o `new-conditions`. A entrada pelo C2C não muda: o `access` já ignora qualquer erro do redeem, inclusive o `409 Intake.ProposalInAnalysis` que o backend devolve até o deploy do PR #3724.

**Entre etapas.** O intake não manda a pessoa de volta ao WhatsApp entre as etapas. Depois da verificação, a entrada do link redireciona para a etapa ativa. Depois de cada etapa, `useAdvanceIntakeStep` consulta o start **uma vez**: se a etapa ativa já mudou, segue para ela. Se não, o volante de tela cheia fica na tela até o `ActiveStatusChanged` (ou o polling de reserva) levar para a próxima. Não há telas de sucesso entre etapas; só a tela final (7.0, `modules/intake-finished`), com a data de desembolso para o vendedor e o botão "Acessar Credicarro", que abre a proposta no painel do site para o comprador (`NEXT_PUBLIC_CREDICARRO_URL` + `/painel/propostas/{proposalId}`) e a home do site para o vendedor (`NEXT_PUBLIC_CREDICARRO_URL`); escondido com white label.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Design system `@twila-digital/components` + `@twila-digital/tokens` (tema `credicarro`), Tailwind CSS v4
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

Não há API falsa: o `npm run dev` fala com a API de dev/staging. No `.env.local`:

- `API_URL`: host da API sem `/api/v1` (ex.: `https://api.staging.credicarro.com.br`).
- `INTAKE_HMAC_SECRET`: o segredo do mesmo ambiente (peça ao time de backend; fica no SSM).
- `NEXT_PUBLIC_WEBSOCKET_URL`: host do gateway para o WebSocket, sem `/api` (o mesmo do `API_URL`).
- `NEXT_PUBLIC_CREDICARRO_URL`: site da Credicarro do ambiente (staging: `https://staging.credicarro.com.br`; produção: `https://www.credicarro.com.br`). A tela final leva o comprador para `/painel/propostas/{proposalId}` e o vendedor para a home.

Para testar, gere um convite de intake no ambiente (proposta com o seu celular) e abra `http://localhost:3000/intake/{token}` com o token do link recebido. O código chega no celular do convite. Para refazer a verificação, apague o cookie `intake_session_*`.

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
    api/intake/   BFF: start, send-token, verify-token, proposal, steps, documentos, realtime/ticket
    intake/       /intake/[token] (entrada) e /intake/[token]/[etapa]
  common/         componentes, hooks, libs, utils, options, enums, records, stores compartilhados
  config/         Datadog e feature flags
  constants/      constantes (times, toast, tailwind-merge-config)
  domain/         tipos da API por entidade (<entidade>.domain.ts)
  modules/        código por feature: <feature>/index.tsx + components/ hooks/ schemas/ ...
  services/       camada HTTP (adapter axios, factory, http/<recurso>), react-query, providers
    http/intake/  client (service, hooks, WebSocket); server/ (API com HMAC, sessão); bff/ (helpers das rotas)
  tests/          setup do Vitest e helpers
  types/          tipos compartilhados
  env.ts          variáveis de ambiente validadas (t3-env)
  proxy.ts        middleware (manutenção)
e2e/              Playwright (specs/, pom/)
terraform/        infraestrutura do Amplify
```

### Chamando a API

- **Novo endpoint de intake:** crie o route handler em `src/app/api/intake/[token]/<acao>/route.ts`. Nos endpoints pós-verificação, use `fetchWithIntakeSession(token, 'intake/<acao>', { method, body, map })` (`services/http/intake/bff/bff-session.ts`), que lê o cookie, chama a API e trata 401/403; nos demais, `intakeServerFetch` + `toBffResponse`; tipe o corpo da API em `src/domain/intake-api.domain.ts`. No client, adicione o método em `services/http/intake/intake-service.ts` e o hook em `use-intake-service.ts`.
- **Envio de etapa:** a tela posta em `steps/{path}` no formato de `intake.domain.ts`; a tradução para o endpoint da API fica em `src/services/http/intake/server/submit-intake-step.ts`.
- **Server Components:** use `getIntakeStart(token)` (deduplicado por requisição) ou `intakeServerFetch` direto.
- **Nova etapa:** crie `src/app/intake/[token]/<rota>/page.tsx` chamando `requireActiveIntakeStep` e renderizando `@/modules/<etapa>`; a rota estática tem prioridade sobre o `[etapa]` genérico.

## Adicionando uma variável de ambiente

1. Declare em `src/env.ts` (`server` ou `client`, e em `runtimeEnv`).
2. Adicione em `.env.example`.
3. E2E: valor real no secret `E2E_DOTENV` + nome em `e2e/.env.secret-keys`, **ou** placeholder em `e2e/.env.ci`.
4. Deploy: valor público em `terraform/config/{staging,production}/terraform.tfvars`, **ou** secreto no array `SECRETS` do `amplify.yml` + parâmetro no SSM.

O teste `src/env-e2e-coverage.test.ts` falha se algum desses passos for esquecido.

## Manutenção

Com `NEXT_PUBLIC_IN_MAINTENANCE=true`, todas as rotas redirecionam para `/manutencao`.

## Deploy

AWS Amplify. PRs para `staging` e `production` disparam o workflow reutilizável `twila-front-pipelines` (`.github/workflows/twila-credicarro-proposal-intake-front.yaml`). O `amplify.yml` lê o `PACKAGES_TOKEN` do SSM antes do `npm ci`; o token do FontAwesome vem do `.npmrc`.

> **Pendências de infra (`TODO(infra)`):** IDs dos apps Amplify no `amplify.yml`, parâmetro `INTAKE_HMAC_SECRET` no SSM e revisão dos `terraform.tfvars` (domínio, `API_URL` e serviço do Datadog são placeholders).

## Pendências com backend/produto

Os pontos "a confirmar" do guia CAR-1879 e o que o front ainda propõe.

**Backend**

- **Opcionais em `documents/required`:** a descrição do endpoint cita documentos opcionais, mas o schema só traz `required[]`. O front mostra só os requisitos.
- **Status de documento:** o front trata `Invalid`/`Rejected` como recusado (`REJECTED_STATUSES`); confirmar os valores.
- **Tipo do vendedor:** o start não diz se o vendedor é PF ou lojista; o front deduz pelas etapas (lojista tem "Dados da empresa") para pedir CPF ou CNPJ do titular em Dados bancários.
- **`account`:** erros de validação do cadastro (CPF, idade) chegam como `Intake.CreateAccountUnexpectedError`, sem `errors[]` (achado 1 do mapa de erros do backend); o front valida tudo antes e já mapeia os `Account.*` nos campos para quando o backend repassar.
- **Telefone do convite:** o start não devolve (nem mascarado); o campo da 1.2.1 fica vazio e desabilitado.
- **Pendências de documento:** o motivo da recusa vem da pendência da etapa cujo `code` é o do documento recusado.
- **Biometria reprovada:** regra de nova tentativa a confirmar; hoje mostra o aviso e reabre a `sessionUrl` devolvida.
- **CORS do bucket S3** para o `POST` multipart a partir do domínio do intake (infra).
- **Link do vendedor:** o start não traz; o front propõe `sellerLink`. Sem ele, o link não aparece.
- **`Intake.SellerAccountRequired`:** não deveria acontecer seguindo o start (o `CreateAccount` vem antes da decisão do vendedor); hoje mostra a mensagem do backend em toast.
- **Cor do veículo:** cor com número volta `RegularExpressionValidator` com mensagem em inglês (achado 3); o front troca por uma mensagem em português no campo.
- **Ano de fabricação (CAR-2095):** nem o start nem o `intake/proposal` trazem o ano de fabricação, então o campo começa vazio (o ticket pede pré-preenchimento). O front aceita de 1950 até o ano seguinte ao atual e, quando o `intake/proposal` traz o ano do modelo, não deixa passar dele (mesma regra do store-area).
- **Data da proposta:** o `intake/proposal` não devolve; o card da confirmação do vendedor (1.3) fica sem a data que o Figma mostra.
- **Modal de CET:** o `new-conditions` não traz "Tarifa de avaliação do bem" nem "Valor total a pagar"; as duas linhas do Figma ficam fora até o backend devolver.
- **Usuário da sessão:** Datadog e feature flags tratam toda sessão como anônima até o backend expor os dados do usuário.

**Produto e design**

- **Vistoria:** a tela só avisa que o link do parceiro chega pelo WhatsApp (o Figma fala em redirecionar, mas o intake não recebe o link).
- **Botão só de ícone sem fundo:** o `IconButton` do DS não tem variante ghost; o chevron do card da proposta segue como `<button>` local até o DS ter uma.
- **Sem Figma:** iframe da Didit e aviso de reprovação, CNPJ do titular (lojista) e dígito da agência em Dados bancários.
- **CNPJ alfanumérico:** o Figma da 3.3 mostra o novo formato; a validação ainda é só numérica.
- **Barra completa nos `steps`:** o start traz só as etapas de ação; o Figma mostra também Proposta, Proposta aprovada e Verificação de segurança.
- "Não sou o vendedor" não tem tela de retorno no Figma (reaproveita a do 8.x). Depois de recusar, o start ainda mostra `DecisionSeller`; um novo envio mostra "Sua decisão já foi registrada".
- **Erros no Figma tratados no front:** o 8.0 mobile usa os botões do desktop.
- **Logo do white label:** liberar o domínio do `whiteLabel.logoUrl` no `images.remotePatterns` do `next.config.ts` e então tirar o `unoptimized` do logo em `app-header.tsx`.
- **Recusar novas condições:** a recusa encerra a proposta, mas o Figma não pede confirmação; vale avaliar um diálogo antes.
- **Vendedor em análise:** o guia pede uma tela de "em análise/aguardando" para o vendedor em `InNegotiation`/`Analysing`, mas não há Figma; o front usa um aviso informativo com texto provisório.
- **Tela 1.2 do fluxo de contraproposta** ("Celular identificado com sucesso"): não é usada; a verificação segue direto para as novas condições, como no resto do intake.
- **Campo desabilitado com erro:** o DS ainda pinta o rótulo e a mensagem de vermelho num campo desabilitado; `common/utils/field-error.ts` contorna até o DS corrigir.
