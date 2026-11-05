# CLAUDE.md

Front do fluxo de criação de pedido via WhatsApp (Parcele Mais / Cartão Simples), copiado do `twila-credicarro-proposal-intake-front`. Segue o mesmo padrão dele, de `twila-credicarro-front` e `twila-credicarro-store-area-front`. Na dúvida, consulte como esses projetos resolvem.

## Comandos

- `npm run dev`, `npm run build`
- `npm run check` (Biome com fix), `npm run check:ci`
- `npm run test` (Vitest), `npm run test:e2e` (Playwright)
- `npx tsc --noEmit`

## Convenções

- **Idioma:** identificadores e testes (`describe`/`it`) em inglês. Rotas, textos de UI, comentários e README em português.
- **Arquivos:** sempre kebab-case. Sufixos: `*.enum.ts`, `*.record.ts`, `*.options.ts`, `*.store.ts`, `*.schema.ts`, `*.domain.ts`, `*-service.ts`, `use-*.ts`, `*.pom.ts`.
- **Componentes:** named export (`export function X`). Só `page.tsx`/`layout.tsx` usam `export default`.
- **Sem barrels**, exceto `services/http/<recurso>/index.ts` (instância do service) e `modules/<feature>/index.tsx` (componente raiz da feature).
- **Rotas finas:** `src/app/**/page.tsx` só busca dados no servidor (quando preciso) e renderiza `@/modules/<feature>`.
- **Testes** co-localizados (`nome.test.ts(x)`). Seletores por role/label; `data-testid` só em último caso.
- **Formatação:** Biome (aspas simples, sem ponto e vírgula, 2 espaços). Nada de ESLint/Prettier.

## UI

- Use os componentes do DS: `@twila-digital/components/<componente>` (button, input, alert/toast, empty-state...). Só crie componente local em `src/common/components` quando o DS não tiver.
- Tokens do DS via Tailwind (`text-h4`, `font-heading`, `px-md`...). Para `max-w-*` use valor arbitrário: o `--spacing-*` nomeado do DS vence o `--container-*`, então `max-w-lg` vira o spacing `lg` (use `max-w-[560px]`) e `max-w-none` vira 0 (use `max-w-[none]`).
- Classes condicionais: `cn()` de `@/common/lib/utils`; variantes: `tv()` de `@/common/lib/tailwind-variants`.
- Mobile first: o usuário chega pelo WhatsApp, quase sempre no celular.
- Loading de tela cheia: o volante do DS (`IntakeLoading`, `Loading variant='brand'`). Aparece no `loading.tsx` das rotas do intake e, no client, via `useIntakeLoading()` (ex.: ao avançar de etapa).
- Sem white label nesta entrega: o tema é o do Parcele Mais. Cor da marca usada como texto, borda ou forma vai com `brand-primary-fg`, nunca `brand-primary-9`.
- Não existe proposta neste projeto: é sempre **pedido** (`order`), em código e em texto.

## Dados

- **O browser nunca chama a API REST de intake** (exige HMAC com segredo de servidor). Client → BFF `app/api/intake/[token]/*` → `intakeServerFetch` (path relativo a `/api/v1`, token no header `X-Intake-Token`, assina e anexa o Bearer do cookie). Corpos da API em `domain/intake-api.domain.ts`; envio das etapas traduzido em `services/http/intake/server/submit-intake-step.ts`.
- HTTP no client: `services/http/<recurso>/` (classe + `httpClientFactory` + hooks React Query com query keys exportadas), apontando para o BFF.
- Dados no servidor: `getIntakeStart(token)` (React `cache`) e `intakeServerFetch`.
- `services/http/intake/`: na raiz só o que roda no browser (`intake-service.ts`, `index.ts`, `use-intake-service.ts`, `intake-realtime-client.ts`); `server/` tem as chamadas à API com HMAC e a sessão (server-only); `bff/` tem os helpers das rotas `app/api/intake` (`fetchWithIntakeSession`, `toBffResponse`, guards, `readJsonBody`). Código `'use client'` nunca importa de `server/` nem de `bff/`.
- Erros da API: `ApiError` (`services/error.ts`) e `handleApiError` (`services/api-error-handler.ts`) para toast e erros de campo.
- Formulários: `useForm` de `@/common/hooks/use-form` com schema Zod em `modules/<feature>/schemas/<nome>.schema.ts`.
- Variáveis de ambiente: sempre via `env` de `@/env`. Para adicionar uma, siga o README (o teste `env-e2e-coverage` cobra isso).

## Acesso ao intake

- Link `/intake/[token]`; o token só é repassado à API, no header `X-Intake-Token` (nas rotas do BFF, sempre com `encodeURIComponent`).
- Verificação: a pessoa escolhe SMS ou WhatsApp (sem digitar o celular) → `intake/send-code` → `intake/verify-code`. O `accessToken` fica em cookie httpOnly por link (`services/http/intake/server/intake-session.ts`). Só a rota `realtime/ticket` o entrega ao browser, porque o gateway exige o token na URL do hub; nenhuma outra rota pode devolvê-lo.
- Tempo real: `IntakeRealtimeProvider` (montado no layout do link quando há sessão) conecta no hub do SignalR com ticket novo a cada conexão, sem `withAutomaticReconnect`. As telas leem `useIntakeRealtime().isConnected` para fazer polling só quando desconectadas.
- Páginas de etapa chamam `requireActiveIntakeStep` (sem cookie → verificação; fora da etapa ativa → etapa ativa). Mapa status → rota em `common/records/intake-step-route.record.ts`.
- Fluxo único (sem papéis nem tipos de proposta): textos das telas em `common/records/intake-flow-copy.record.ts`.
- Contrato da API: `swagger.json` na raiz (endpoints `/v1/intake/*`). HMAC só em `start`/`send-code`/`verify-code` (`common/lib/hmac.ts`); 401/403 nas rotas de etapa apaga o cookie (`toBffStepResponse`).
- Cada etapa é um módulo `modules/intake-<etapa>`; `modules/intake-step` escolhe a tela pela rota e carrega os dados no servidor (`getIntakeStepData`).
- Ilustrações dos títulos e seus recortes do Figma: `constants/illustrations.ts`.
- Pendências com o backend e produto ficam no README (seção "Pendências com backend/produto"), não em comentários no código.
