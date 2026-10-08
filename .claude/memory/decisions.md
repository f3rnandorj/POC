# Architecture Decision Records (ADR)

Append-only. Never delete. Format: date heading + decision + reason + rejected alternatives. Every append also adds/sorts a row in `decisions-index.md`.

---

## 2026-09-30 — `.claude/` is the single source of truth; brain is fallback

**Decision:** project standards, ADRs and templates live in `<repo>/.claude/`. `~/.claude/brain/` is a reference library, read only when the user invokes it, when `.claude/` is silent (declared out loud), or to break a tie between contradicting local files.

**Reason:** keeps the brain agnostic and the project decisions next to the code they govern; avoids paying brain load cost on every prompt.

**Rejected:** brain-only (wrong defaults applied silently, no mechanical gate); duplicating brain content into the repo (drift).

---

## 2026-09-30 — Declared axes: mobile · ai-assisted · solo · API-Bound

**Decision:** profile `mobile` (React Native CLI), dev mode `ai-assisted`, team `solo`, infra pattern `API-Bound`. Written in `CLAUDE.md` + `config.yml`, and never re-detected or re-asked by a future harness run.

**Reason:** the repo was empty at bootstrap (README only), so detection would have produced nothing. The README declares React Native + Storefront API; the user chose ai-assisted.

**Impact:** PRD pipeline (executor/linter/guardian), orchestration, CI, PR pack and team pack are **not installed** — their matrix conditions do not hold. They enter on a later upgrade if the project grows a team or a PRD flow.

---

## 2026-09-30 — Shopify Storefront API + GraphQL, version-pinned

**Decision:** the app talks to the Shopify **Storefront API** over GraphQL, with the API version pinned in the endpoint path. The Admin API is never called from the device.

**Reason:** Storefront is the buyer-facing, read-only surface, safe with a public token on a device, and it exposes published metafields — the exact channel the merchant controls without a deploy. One GraphQL request shapes the whole Product Detail screen.

**Rejected:** Admin API (needs a server secret, grants writes — must never ship in a bundle); REST Storefront (N round-trips for one screen, no metafield selection); a proxy backend (README explicitly excludes an own backend).

---

## 2026-09-30 — API-Bound infra, no repository abstraction

**Decision:** `screen → useCase hook → service → api → adapter`. The domain layer is deliberately coupled to the Storefront transport. No `I{Entity}Repo` interfaces, no DI container, no in-memory adapter.

**Reason:** there is exactly one transport and no second environment to swap it for. The brain's Decoupled pattern buys nothing here and costs a layer of indirection on a one-day POC.

**Rejected:** Decoupled/IoC (the Expo-profile convention) — speculative flexibility for a swap that will not happen.

**Impact:** if a second data source ever appears (own backend, mock store), this is the ADR to revisit — the adapter is the seam to introduce the interface at.

---

## 2026-09-30 — Metafields: explicit identifiers, adapter-owned parsing, absence is `undefined`

**Decision:** metafields are requested by explicit `identifiers` in the GraphQL document. The **adapter** tolerates `null` array entries, parses `value` by type (boolean/json/number), normalizes every absent or unparseable value to `undefined`, and the rendering component returns `null` on a falsy value.

**Reason:** Storefront returns a positional array with `null` holes and always-string values. Centralizing that in the adapter means the "if the info doesn't exist, don't show it" requirement is implemented once per component instead of once per screen — and no screen can leak `undefined` into the UI.

**Rejected:** per-screen conditionals (the rule then has N enforcement points and drifts); default strings like `'—'` (the README forbids visible placeholders); `null` in the domain model (two absent-value checks instead of one).

---

## 2026-09-30 — Merchant variation = credentials + feature flags + theme tokens

**Decision:** three variation layers only — Storefront credentials, `features` flags, and theme token overrides — all in `src/config/merchant/`. A merchant name may not appear anywhere else in the tree.

**Reason:** answers the README's "50 merchants without 50 apps" directly, and makes Cases 3-5 config changes rather than new components. Anything that cannot be expressed in those three layers is a platform feature, built generically and flagged off.

**Rejected:** merchant-named components (`NorthstarWinterBadge`) — the exact anti-pattern the POC grades against; a build-time flavor per merchant (50 build configs); runtime remote config (needs a backend, excluded by the README).

---

## 2026-09-30 — No test layer; verification is the simulator

**Decision:** no Jest/RTL/MSW setup, and therefore **no coverage gate** (`check-coverage-map.sh` is not installed). A change is done when it was exercised on a running simulator/emulator against the real store.

**Reason:** the README explicitly excludes automated tests from the POC scope. A coverage gate matching nothing is worse than no gate — it looks like coverage.

**Rejected:** installing Jest "for later" (setup cost with no caller); an aspirational quick-rule demanding tests (makes the AI emit imports against absent infra).

**Impact:** quick-rule #11 states the absence explicitly. If tests are added later, install the gate in the same session.

---

## 2026-09-30 — Design identity: streetwear, neutral + one accent, geometric sans, compact

**Decision:** the identity is fixed in `standards/design.md`: near-black background, one merchant-overridable `accent`, geometric sans with a wide title/body jump, spacing base 4, one radius scale, no shadow scale. `ProductBadge` is the identity primitive.

**Reason:** the README says a pretty app is not the goal, but the bonus asks for per-merchant theming — so the identity must exist as tokens from the first screen, or every session re-invents it and the merchant theme override has nothing to override.

**Rejected:** no design tokens (the theme override in `merchantConfig` becomes meaningless); a full design system (out of scope per the README).

---

## 2026-09-30 — Knowledge graph installed below the matrix threshold

**Decision:** graphify is declared in `CLAUDE.md` with the self-healing rule, plus a `PostToolUse` queue hook (`graph-queue.sh`) and a drain script (`scripts/graph-sync.sh`).

**Reason:** the user asked for it explicitly, including automatic upkeep. The matrix condition (≥ ~200 source files, or unfamiliar codebase) does **not** hold — the repo had zero source files at bootstrap.

**Consequence to watch:** the graph is empty until the RN app is scaffolded. The self-healing half of the rule ("missing or stale → rebuild first, then proceed") is what makes the declaration safe meanwhile. Git hooks were not used because the repo is not yet a git repo; if husky is later installed, use thin versioned `.husky/post-commit` hooks — `graphify hook install` writes into `.husky/_/`, which is regenerated on every `yarn install` and dies silently.

---

## 2026-10-01 — Conventions derive from `bennu/food-balance`, not from a template

**Decision:** `~/Desktop/projects/bennu/food-balance` is the canonical RN CLI reference. Where this harness and that repo disagree, the repo wins. Six rules were corrected to match it:

1. UseCase hooks are `use{Domain}{Action}{Target}` (`useProductGetList`), never verb-first.
2. `{domain}Service/Api/Adapter` declare their functions first and close with the singleton object — the inverse of the component rule.
3. No `index.ts` inside a single-file component folder; `components/index.ts` is the single root barrel (food-balance: 1 barrel for 39 component folders).
4. `domain/{Domain}/index.ts` exports **useCases + types only** — never the service, which makes "screens may not call the service" structural instead of documented.
5. Screens carry the `Screen` suffix on folder and file, with no per-screen `index.ts`; the group barrel re-exports `./{Name}Screen/{Name}Screen`.
6. `theme/textVariants.ts` is its own file.

**Reason:** the harness was bootstrapped from a generic template although the user had explicitly rejected the proposed structure and asked to follow the existing one. The divergence surfaced only when the two were diffed by hand, after the Shopify setup was already done.

**Also fixed upstream, in the brain:** `rn-cli/architecture.md`, `rn-cli/patterns/use-case.md` and `developer/code-structure.md` carried the same errors — plus an internal contradiction in `code-structure.md`, which stated the 4+ barrel threshold and then showed an `index.ts` in a single-file component folder. `rn-cli/rn-cli.md` now names food-balance as the canonical reference, so a future bootstrap derives from the repo instead of improvising.

**Rejected:** keeping the template conventions in the POC "because it's only a POC" — code that looks like the author's own is more defensible in an interview, and the divergence would have to be explained rather than read.

---

## 2026-10-01 — PRD 001 (App Foundation) execution decisions

**Context:** scaffolding the RN CLI app and the four cross-cutting pieces (aliases, theme, query client, navigation shell) onto an existing repo that already held `README.md`, `CLAUDE.md`, `.claude/` and `.env`.

1. **Jest is not merged from the template.** The RN CLI scaffold ships `jest.config.js`, `__tests__/` and jest devDependencies. All were dropped on merge, and `tsconfig` sets `"types": []`. The declared fact is "no test layer installed" (quick-rule #11); carrying a config nothing runs contradicts it and makes `tsc` fail on a missing `@types/jest`.

2. **`theme/colors.ts` is split out of `theme.ts`.** `textVariants.ts` must type its `color` against the semantic token names, and importing `theme.ts` for them is circular. `colors.ts` holds the semantic map and exports `ColorToken`; `theme.ts` consumes it. The token list has one source instead of a hand-kept duplicate.

3. **Every text variant carries a `color` token, including `defaults`.** Found on the simulator: `displayLarge` rendered near-black on the near-black background because Restyle's `Text` has no default color and the variant declared none. The fix is in the theme, not at the call sites — every caller of `<Text>` was affected, not just the one screen that showed it.

4. **`react-native-config` is wired in this block, consumed in 008.** The native plumbing is foundation work: the pod's `Config codegen` script phase autolinks, `dotenv.gradle` is applied in `android/app/build.gradle`, `.env.example` is tracked with key names only, and `src/types/env.d.ts` types the three keys. `merchantConfig.ts` reading them stays in PRD 008 (standards/security.md: the token is consumed once, there).

5. **Android keeps the default scaffold.** iOS is the demo target. `dotenv.gradle` is applied so a later Android run is not blocked, but no Android build was exercised.

7. **The knowledge graph is scoped by `.graphifyignore`.** `graphify update .` indexed `ios/Pods` and produced a 40,783-node graph of CocoaPods internals (the tool skips `node_modules` by default but not Pods). `.graphifyignore` now excludes the native dependency trees and build output; the graph is 53 nodes of the app's own source. `graphify-out/cache/` is gitignored (~200MB of regenerable blobs).

**Rejected:** keeping the template's `App.tsx` at the repo root — `index.js` now points at `src/App.tsx` so the whole app lives under the aliased tree.

6. **Inter is linked as a real asset, and weight is selected by face.** `standards/design.md` names Inter or Satoshi; the block first shipped the iOS system font, and the user chose to close the gap in 001. `src/assets/fonts` holds Inter-Regular/Medium/Bold (SIL OFL, license kept beside them), linked to both platforms by `react-native-asset` via `react-native.config.js`. `theme/fonts.ts` holds the PostScript names and each text variant sets `fontFamily` instead of `fontWeight` — RN would otherwise synthesize a faux bold on Android rather than use Inter-Bold.

---

## 2026-10-01 — Git writes are the user's step (quick-rule 20)

**Context:** executing PRD 001, the AI ran `git init` and two commits without being asked. It read US-001's acceptance criterion `git init + first commit` as the user's request.

**Decision:** quick-rule 20. `git init`, `add`, `commit`, `branch`, `tag`, `push` and PR creation all require an explicit request from the user. The AI delivers one uncommitted batch and reports what changed. Approval for one commit never extends to the next.

**Why the rule was missing:** it existed in the brain, but only as rule 2 of the `prd-executor` agent contract ([[personal/tools/ia/harness/enforcement]] §"PRD executor agent"). This project is `dev mode: ai-assisted`, where the PRD agents are **not installed** (see `prds/_index.md`), so the contract never reached the main assistant.

**Two lessons, both pushed upstream to the brain:**

1. A rule that lives only inside an agent contract does not exist for a project that never installs that agent. Anything that must hold regardless of who is driving belongs in `quick-rules.md`, with the agent contract repeating it.
2. A spec acceptance criterion is not a user request. An AC saying "commit" describes the block's definition of done, not standing permission to produce it.

**Rejected:** enforcing it in `hooks/bash-guard.sh`. A hook cannot tell an authorized commit from an unrequested one, so it would block the user's own "faça o commit" — a worse failure than not gating it. This rule is carried by the model, which is why it sits in the always-loaded file.

**Upstream (brain):** seed rule N+7 in `templates/quick-rules-seed.md`; new baseline section §"Git writes are the user's step" in `harness/enforcement.md`; retrofit pack dated 2026-10-01 in `harness/upgrade-packs.md`; capability-matrix row bumped to 8 rules in `harness/upgrade.md`; bootstrap Step 11 no longer commits; bootstrap checklist now requires all eight seed rules.

---

## 2026-10-01 — PRD 002 (Shopify Product Data Layer) execution decisions

1. **No HTTP dependency.** `fetch` is built into React Native; the Storefront client is a POST with two headers. Quick-rule #1 allows axios or `graphql-request`, neither of which earns its install for one endpoint.

2. **Fragments split into `ProductCore` and `ProductCard`.** The first cut put `images(first: 1)` in the shared card fragment while the detail query asked for `images(first: 10)`. GraphQL rejects a document where one field carries two argument sets — `Field 'images' has an argument conflict` — and the whole detail query failed, silently, because the list query still worked. `ProductCore` now holds what both screens share **except** images; each query selects its own page size. Lesson: a shared fragment may only contain fields whose arguments every consumer agrees on.

3. **Metafield identifiers live in `merchantConfig.metafieldIdentifiers`**; `fragments.ts` renders them into the GraphQL selection. A merchant whose keys differ is a config change, not a query edit (standards/shopify.md rule 4).

4. **`merchantConfig` throws on a missing env var**, naming the key and never the value. An empty token otherwise surfaces as a 401 three screens later, which reads like a code bug.

5. **The adapter indexes metafields by `key`, never by position.** Verified against the live store: the Everyday Tee returns `[null, null, null, null, null]` and Northstar Essential a trailing `null`. This was the block's highest-risk line and it is now the one place that knows the array is positional.

**Verified on the simulator:** both products from the live store, metafields rendered only where present, the Everyday Tee with none and no crash, and the detail hook flagging the Blue variant as sold out.

**Open for PRD 006:** `care_instructions` returns `null` for both products — the definition is absent or not published to the Storefront API, and it must be fixed in the Shopify admin before that block starts. The `json` parse branch lands with it.

---

## 2026-10-01 — PRD 003 (Product Browse) execution decisions

1. **A back control on the detail screen, beyond the ACs.** The stack runs `headerShown: false` so the product image stays full-bleed, which left the iOS edge-swipe as the only way off the screen. That is a dead end when the gesture fails and unusable for anyone who cannot perform it. `components/BackControl.tsx` is the visible, focusable equivalent. Accessibility basics are not simplified away, even when no AC names them.

2. **Deep links added, then removed.** They went in to drive the simulator without synthetic mouse events. They work, but iOS 26.5 raises an "Open in …?" confirmation for a custom scheme opened from outside — with the app foregrounded *and* with it terminated first — so they never became hands-free. With push out of scope by the README and no web surface, nothing else consumed them, and a URL route param would have needed the shape check `security.md` requires. Cost: two native rebuilds. **Rule taken from it: never add a product feature in order to test the product.**

3. **The simulator is driven by a temporary render change, never by synthetic input.** Posting CGEvents moves the developer's *real* cursor and steals focus from whatever they are doing on the same machine — reported by the user mid-block. Flipping `initialRouteName` or adding a one-shot `useEffect`, screenshotting with `simctl io`, then reverting, is the only reliably hands-free method. Recorded in the brain (`rn-cli/tooling/simulator.md`) and in project memory.

4. **The variant picker hides itself on a single `Default Title` variant.** Shopify returns that name for a product with no real options; one chip reading "Default Title" is noise, so `hasMeaningfulChoice` returns false and the component renders nothing. Verified live on the Everyday Tee.

5. **The first *available* variant is preselected**, so the CTA starts enabled. If every variant were sold out nothing is selected and the CTA stays disabled.

6. **Price formatting lives in `utils/priceUtils.ts`**, never in the adapter. Shopify sends money as a string to preserve precision; whole amounts render without cents (`$299`), fractional ones keep two digits.

**Verified on the simulator against the live store:** 2-column grid, both products, detail with BLACK preselected / BLUE sold out and unselectable / WHITE selectable, and the Everyday Tee rendering no picker at all.

**Open:** both products carry placeholder images (screenshots of an Apple receipt). The app renders them correctly; `design.md` puts the product photo at the centre of the screen, so the demo reads wrong until they are replaced in the admin. The user is handling it.

---

> When a new decision is made, append below with a date heading and add its row to `decisions-index.md` in the same edit.

## 2026-10-01 — PRD 004: metafields renderizados por componente genérico

**Contexto.** Os três metafields de texto (`badge`, `material`, `promotion_text`) já chegavam parseados do adapter desde a PRD 002. Faltava só o render, e o critério de nota da POC é o produto *sem* metafield não deixar rastro.

**Decisões.**

1. **Absent-case validado no admin real, pelo usuário.** O primeiro passe provou o caso em código (render temporário, revertido) porque mutar dado real do merchant não é chamada do app e o token é read-only. O usuário então rodou no admin de verdade: `material` com Storefront access revogado (caso de produção mais comum — vira `null`, a linha some, nada quebra), `material` só com espaço (o trim do adapter absorve) e `promotion_text` com 143 caracteres (quebra em 4 linhas, não clipa, CTA segue fixo). Essa rodada também fechou o caso parcial ponta a ponta, que o passe em código só tinha provado no nível do componente.

2. **`ProductMetadata` usa `{value ? <Text/> : null}`, não `{value && <Text/>}`.** O adapter já mapeia `''` para `undefined`, então na prática as duas formas rendem igual. Mas `&&` vaza string vazia para a árvore quando a garantia do adapter falhar, e string solta fora de `<Text>` é crash no React Native — o ternário não tem esse modo de falha.

3. **Sem prefixo de label nas linhas de metadata.** `Material:` é exatamente a construção que vira `Material: undefined` quando o metafield some. Os valores do merchant já leem como frase.

4. **Badge não entrou no `ProductCard`.** Escopo da PRD é a tela de detalhe; a grid segue título + preço.

**Consequências.** Um quarto metafield de texto custa: identificador no `merchantConfig`, campo no `ProductMetafields`, linha no adapter, uma linha de render. Nenhuma tela, navegação ou client é tocado.

## 2026-10-01 — Rodapé fixo sobre scroll: reservar espaço medido, não constante

**Contexto.** O `ProductDetailScreen` tem o CTA fora do `ScrollView`, flutuando sobre ele. Sem reserva no fim do conteúdo, o último bloco (o seletor de variante) ficava permanentemente atrás do botão. Achado ao validar a PRD 004; o defeito era da PRD 003.

**Decisão.** O `ScrollView` recebe `contentContainerStyle={{ paddingBottom: footerHeight }}`, e `footerHeight` vem de um `onLayout` no próprio rodapé.

**Por que não uma constante.** A altura do rodapé é `bottom` da safe area + paddings + a linha de texto do botão. Os três variam: aparelho com e sem home indicator, escala de fonte do sistema, e o label alternando entre "Add to cart" e "Sold out". Qualquer número fixo fica certo em um aparelho e errado no próximo.

**Consequência.** Vale para toda tela que ponha barra fixa sobre scroll. Se uma segunda aparecer, o par `onLayout` + `paddingBottom` vira hook em `hooks/`.

## 2026-10-01 — PRD 005: label do badge em config, linha de badges condicional por layout

**Contexto.** Primeiro pedido não planejado do merchant. O metafield `is_winter_collection`, o campo no domínio e o `readBoolean` já tinham vindo na PRD 002, então o bloco era só render.

**Decisões.**

1. **O texto do badge vem de `merchantConfig.labels.winterCollection`.** O exemplo em `standards/shopify.md` e no template hardcoda `'WINTER COLLECTION'` na tela; a US-002 da PRD manda o contrário e a PRD vence na precedência. `MerchantConfig` ganhou um bloco `labels` ao lado de `features` — a flag diz *se* a capacidade existe, o label diz *como* ela se chama.

2. **A linha dos dois badges é condicional, e a condição é de layout, não de dado.** Dois `ProductBadge` lado a lado precisam de um `Box` em row com `gap="s8"`. Esse `Box`, quando vazio, continua sendo um item flex da coluna e consome um `gap="s12"` — exatamente o buraco que a quick-rule #5 proíbe. Por isso a row só existe quando algum dos dois textos existe. Cada `ProductBadge` continua dono da própria ausência; o guard não é checagem de dado.

3. **Dois badges `accent` lado a lado ficam.** A Technical Consideration previa trocar o segundo por tratamento outline se lessem como ruído. Revisados no simulador, leem como intenção. Variante outline não foi construída.

**Consequência.** Um segundo badge para outro merchant custa: entrada em `labels`, flag em `features`, uma expressão na tela.

## 2026-10-01 — Um simulador, nunca uma matriz de devices

**Contexto.** O quality gate da PRD 006 pedia "exercised at 375pt". O modelo começou a subir um iPhone SE e instalar o build nele. O usuário cortou: validar em segundo device não se faz neste projeto, e isso vale também para o brain.

**Decisão.** Validação acontece no simulador **já aberto**, e só nele. Não subir segundo simulador, não instalar o build em outro modelo, não rodar matriz small/large — nem quando uma PRD nomeia uma largura.

**Por quê.** Subir um segundo device custa boot + install + bundle para uma screenshot que reproduz o que o primeiro já mostra. Layout que quebra em largura menor quebra porque o conteúdo cresce além da caixa, e isso se prova **no device em mãos** forçando conteúdo: título de 3 linhas, promo de 200 caracteres, valor de seção de 140. Segurou ali, o device estreito não acrescenta nada; clipou ali, o device estreito nunca foi o achado.

**Leitura de specs.** Uma largura nomeada numa PRD (`375pt`) é **intenção** ("isto precisa sobreviver a texto longo em coluna apertada"), não device a provisionar. Satisfazer a intenção e registrar na PRD que a largura foi exercida por conteúdo.

**Onde ficou.** Quick-rule #11 (estendida, sem renumerar), `standards/design.md` §Validation, e no brain em `developer/frontend/mobile/rn-cli/tooling/simulator.md` — que antes ensinava o oposto ("instale o `.app` num segundo device em vez de rebuildar"). Os dois comandos de segundo device seguem lá, marcados como "só quando o usuário pedir".

## 2026-10-01 — PRD 006: seção genérica e JSON de merchant como entrada não confiável

**Contexto.** Segundo pedido não planejado: `care_instructions`, metafield JSON, vira uma seção "How to care" abaixo da descrição.

**Decisões.**

1. **`ProductSection` é genérico de verdade.** Recebe `title` e uma lista de `{ label, value }`, descarta item sem valor e devolve `null` quando nenhum sobra — o heading e a hairline de cima nunca aparecem sozinhos. Renderia "Ingredients" ou "Sizing" sem edição.

2. **`readJson` com try/catch no adapter, nunca acima dele.** JSON de metafield é texto livre escrito pelo merchant e chega ao device sem validação. Valor malformado degrada para ausente. Provado no simulador com `'{"washing": broken'`: a tela renderiza inteira, a seção some.

3. **A flag resolve no mesmo lugar que o dado.** `features.productCare` desligada produz `undefined` antes do componente, igual ao produto que não define o metafield — a tela não envolve o componente em condicional e `ProductSection` segue dono do caso vazio.

4. **`washing`/`drying` hardcoded, e isso está declarado.** As chaves são do merchant. Outro merchant com outras chaves é a PRD 008; esta PRD diz isso explicitamente nas Technical Considerations, então não é V2 por iniciativa do modelo.

**Consequência.** O bloco custou: um identificador no config, um campo no tipo, uma linha no adapter, um componente genérico e uma chamada na tela. É a prova que a arquitetura das PRDs 002-004 pedia.

## 2026-10-01 — PRD 007: Collection pelo mesmo pipeline, e dois defeitos antigos

**Contexto.** Fecha a árvore de navegação: Home com destaques e collections, alimentando a lista existente. Fora do caminho da EMV.

**Decisões.**

1. **`collectionAdapter` importa `productAdapter` por caminho relativo.** O barrel do Product exporta só useCases + tipos (quick-rule #10), e os produtos aninhados de uma collection precisam sair do mesmo mapper que a grid usa. Um segundo `toProduct` seria exatamente a divergência que a regra existe para evitar. A exceção está comentada no import.

2. **Uma tela de lista, dois escopos.** `useProductGetList(!collectionHandle)` e `useCollectionGetProducts(handle)`, cada um desabilitado no modo do outro. Sem segunda tela, sem request desperdiçado.

3. **`BackControl` subiu para `@components` com `top` opcional.** Flutuante sobre a imagem full-bleed do detalhe, em fluxo normal na lista. Com a Home virando entrada, a lista deixou de ser raiz da stack e o edge-swipe seria a única saída.

4. **"Featured" é o primeiro N do catálogo.** Shopify não tem esse conceito. Comentário `ponytail:` aponta o caminho: um handle de collection `featured` no `merchantConfig` quando um merchant curar uma.

**Defeitos pré-existentes corrigidos.**

1. **React Query v5 recusa `undefined` como dado em cache.** `productService.byHandle` e `collectionService.productsByHandle` devolvem `undefined` para "não encontrado", o que virava *"Query data cannot be undefined"* e tela de erro no lugar do estado vazio desenhado. Os dois useCases agora mandam `null` pelo cache e devolvem `undefined` para a UI — o contrato de ausência das telas não muda. O detalhe de produto tinha o mesmo buraco desde a PRD 002; nunca apareceu porque todo handle testado existia.

2. **`numColumns={2}` estica o último card de linha ímpar.** Collection com 1, 3 ou 5 produtos renderizava o último card na largura toda. `maxWidth="50%"` no wrapper do item.

**Pendente, e não é do modelo.** A loja tem só a collection `frontpage` criada automaticamente pelo Shopify; duas collections reais publicadas no canal Headless são passo de admin do usuário. E o tap-through Home → collection → lista → detalhe precisa de toque humano, porque dirigir o simulador por evento sintético de cursor é proibido.

## 2026-10-01 — PRD 008: merchant vira dado, não ramificação

**Contexto.** Responder "a mesma feature para mais 10 merchants" com código rodando, não com parágrafo.

**Decisões.**

1. **Metafield deixou de ser lista e virou mapa `conceito → {namespace, key}`.** A query monta os identificadores a partir dos valores do mapa; o adapter resolve cada conceito pelo mesmo mapa. Merchant que chama `material` de `fabric_type` custa uma entrada de config. `MetafieldConcept` é declarado em `merchantTypes.ts` e não derivado de `ProductMetafields` — config fica abaixo do domínio e a dependência precisa correr num sentido só.

2. **Conceito omitido nunca é pedido.** `flatMap` tira ele do documento GraphQL e o `find` do adapter devolve `undefined` — idêntico a qualquer metafield ausente, então a quick-rule #5 vale sem segundo caminho de código.

3. **`accentText` é derivado, não um segundo override.** `theme.primaryColor` sobrescreve só o `accent`; a cor do rótulo em cima dele sai da luminância relativa WCAG (`theme/contrast.ts`). Cor de marca de merchant não consegue produzir CTA ilegível. Conferido na tela: `#4D7CFE` resolve para o quase-preto a 5.3:1, e o `volt` base resolve para o mesmo token que o tema já usava — Northstar ficou idêntico.

4. **Hex de marca mora no config do merchant.** A quick-rule #9 diz que `palette.ts` é o único arquivo com literal de cor, e ela governa o **tema base**. O accent de um merchant é dado de merchant, não token de design, e `config/merchant/` é exatamente onde dado de merchant vive.

5. **O segundo merchant reusa as credenciais da loja real, e isso está dito no import.** A POC tem uma loja de dev. Forjar catálogo seria pior que reusar um real com um comentário `ponytail:` nomeando o caminho de produção: instalação OAuth → endpoint da plataforma → mesmo shape.

**Consequência.** Trocar `ACTIVE_MERCHANT_ID` muda accent, capacidades habilitadas e chaves de metafield ao mesmo tempo. Adicionar merchant é um arquivo em `config/merchant/merchants/` e uma linha no record.

## 2026-10-01 — PRD 009: seed de catálogo e o custo de escolher foto pelo link

**Contexto.** A loja tinha 2 produtos e 2 coleções sem capa. Toda tela lia como stub.

**Decisões técnicas.**

1. **`productSet` com `identifier: { handle }`.** A PRD presumia dois writes por produto (`productCreate` + `productVariantsBulkCreate`). O `ProductSetInput` leva opções, variantes, mídia, metafields e coleções juntos — e o `identifier` é o que faz virar upsert. Sem ele a mutation sempre cria e o rerun morre em "handle already in use".

2. **Disponibilidade por rastreamento, não por quantidade.** Variante rastreada nasce em zero e lê como esgotada; não rastreada é sempre disponível. Quantidade real exigiria `read_locations` e um location id, sem ganho nenhum numa demo.

3. **Conteúdo em `catalog.mjs`, maquinário em `seed-catalog.mjs`.** Trocar foto ou preço é editar dado; não deve exigir ler GraphQL.

4. **Token Admin em `~/.config/northstar-poc/admin-token.sh`, modo 600.** O scratchpad é da sessão e a Shopify revela o token Admin uma vez só — perder significa desinstalar e reinstalar o app. Nunca no `.env`, nunca no repositório.

**O erro que custou mais caro: escolher foto por "o link responde" em vez de "a imagem serve".** O primeiro passe subiu um flat lay com tênis Puma e duas peças Champion no quadro, uma figura encapuzada de máscara de Guy Fawkes como jaqueta, e quatro retratos noturnos ao lado de duas fotos de estúdio. Grade virou colagem de banco de imagem.

Checados Unsplash, Pexels e o Burst da própria Shopify: **não existe acervo gratuito de peça isolada em fundo preto.** Quem fotografa peça sozinha usa branco; quem fotografa escuro bota pessoa dentro. As duas fotos originais da loja só escapam disso porque são **geradas por IA** (`ChatGPT_Image_*.png` nos arquivos da loja).

Então o catálogo padronizou **no claro**: UI preta, tile de produto claro, como a maioria das lojas de roupa faz. E a linha de produtos foi reescrita em volta das fotos que existem e são livres — não há moletom no catálogo porque não há foto gratuita de moletom isolado, e inventar o produto para casar com um retrato foi exatamente o erro do primeiro passe.

**Regra que fica:** foto de seed se escolhe pelo que está no quadro — marca de terceiro, pessoa, fundo — antes de se checar se o link responde.

**Deleção é do usuário.** Trocar a linha deixou seis produtos órfãos. A etapa de delete foi escrita e recusada pelo harness; o usuário removeu pelo admin. O script semeia e restiliza, nunca apaga — que é a forma certa para ele de qualquer jeito.

## 2026-10-02 — PRD 012: variação de lojista é uma lista de content blocks

**Contexto.** A PRD 008 tornou *onde* um conceito mora na Shopify um dado do lojista: `material` pode ser `custom.material` ou `acme.fabric_type` e o app não se importa. Ela deixou *quais* conceitos existem em código — `MetafieldConcept` era uma união fechada de cinco, `features` e `labels` eram booleanos e strings **obrigatórios** nomeados por eles, e a `ProductDetailScreen` colocava cada um à mão. Esses cinco eram exatamente o que estava configurado no admin do Northstar. Lojista com `fit_guide` custava edição de tipo, de adapter e de tela — um deploy por lojista.

**Decisão.** O vocabulário de conceitos sai do código. Cada lojista declara uma lista de blocos; o bloco diz de onde vem o dado, como parsear, qual primitiva desenha, em que slot e em que ordem. **O app é dono da gramática** (os `kind`, os `slot`, o parsing, as primitivas). **O lojista é dono das palavras** (quais blocos existem, source, labels, posição).

**Morreram:** `MetafieldConcept`, `MerchantMetafieldMap`, `MerchantMetaobjectMap`, `MerchantFeatures`, `MerchantLabels`, `ProductMetafields`, `ProductCareInstructions`, e a fiação conceito-a-conceito na tela de detalhe. O diff é negativo.

**Decisões técnicas.**

1. **Config manda em `slot` e `order`, não só em quais blocos existem.** Escolhido pelo usuário em 2026-10-02 sobre as duas alternativas (app fixa o layout; config escolhe só o slot). O lojista rearranja a página sem deploy. A contenção é que `kind` e `slot` são **pareados numa união discriminada** — par ilegal é erro de compilação, não tela quebrada em produção. `story` só existe em `homeFooter`: um segundo lugar significaria uma segunda query numa tela que nenhum lojista pediu.

2. **Colisão de `order` custou uma linha, não um branch de validação.** `Array.prototype.sort` é estável, então ordenar só por `order` faz duplicata cair na ordem de declaração e número fora de faixa virar apenas uma posição. A normalização que eu tinha estimado não existe.

3. **Adapter indexa por `namespace:key`, não por `key`.** Revoga a escolha da PRD 008. `key` sozinho não é identificador: com lojista declarando as próprias sources, `custom.badge` e `promo.badge` eram dois metafields caindo num slot. `namespace` entrou na seleção GraphQL.

4. **Dois níveis de confiança, e só um é fronteira.** O arquivo de config é nosso: tipado, compilado, erro de tipo se errado. Os **valores** de metafield são do lojista, chegando como string do admin — essa é a fronteira, e `readText`/`readBoolean`/`readJson` a guardam. `readJson` agora também rejeita payload que não é objeto, e cada linha de seção rejeita o que não é string nem número finito: objeto dentro de `<Text>` quebra o RN. Quando o config vier como JSON do endpoint da plataforma ele deixa de ser nosso e precisa do próprio parse — fora de escopo, anotado no `ponytail:` do `merchantConfig.ts`.

5. **Tipo estático do JSON de metafield foi perdido, e isso é correção e não regressão.** `careInstructions?: { washing?, drying? }` *afirmava* um shape sobre uma string escrita pelo lojista; nunca garantiu nenhum. O `fields` do bloco troca a afirmação pelo lojista declarando quais chaves ele realmente preencheu — e é o que levou `'Washing'`/`'Drying'` da tela para o config, a última cópia de lojista hardcoded.

6. **Flags não viraram `Partial`, foram deletadas.** Flag e bloco sempre foram a mesma frase dita duas vezes; o Atlas provava isso carregando `features.winterCollection: false` ao lado de um `labels.winterCollection` que não podia renderizar. Ausência do bloco diz uma vez.

7. **`isWinterCollection` deixou de ser caso especial.** Consumia um conceito, uma flag e um label para expressar "mais um badge, condicional". Como bloco `badge` com source `boolean` e um `label`, é indistinguível de qualquer outro badge — que é o ponto: nunca foi conceito de plataforma, era a campanha de um lojista com nome de API.

8. **Adapter por loja foi recusado.** A leitura literal de "um adapter por loja" são 50 módulos para shippar e um deploy por onboarding. Um adapter que lê a declaração da loja entrega o mesmo sem código por loja. Se uma loja genuinamente irregular precisar de lógica, a porta é uma função `parse?` no bloco — não um módulo, e não antes de alguma loja precisar.

9. **`ContentBlocks` devolvendo `null` tornou estrutural o achado da PRD 005.** A linha de badges não precisa mais do condicional de layout na tela: slot vazio não desenha container, então o `gap` da coluna não abre buraco. O bug virou impossível em vez de contornado.

**Consequência.** Conceito novo é uma entrada de array no arquivo do lojista. Se exigir tipo, adapter, query ou tela, o **kind** é que está faltando — e kind novo é mudança de plataforma, não de lojista.

## 2026-10-02 — iOS 27 exige UIScene: o app não subia, e não era o JS

**Contexto.** O gate de simulador da PRD 012 travou: `yarn ios` compilava e instalava com exit 0, e o processo morria no launch. O Metro servia o bundle normalmente (HTTP 200, 5.3 MB) e **nunca recebia request do device** — ou seja, o app morria antes de buscar o JS. O crash report apontava `EXC_BREAKPOINT` em `__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke`.

**Causa.** O iOS 26+ encerra no launch qualquer app que não adotou o UIScene lifecycle. O `ios/Fuego/Info.plist` não tinha `UIApplicationSceneManifest` e o `AppDelegate.swift` era o template clássico `UIApplicationDelegate` + `UIWindow` que o React Native 0.87 ainda entrega. Defeito pré-existente: quebrava igual no `main`, sem uma linha da PRD 012. Só existe runtime iOS 27.0 instalado, então não havia device mais antigo para contornar.

**Decisão.** Adotar scenes com a menor superfície possível:

1. **`SceneDelegate` mora dentro de `AppDelegate.swift`.** Um `SceneDelegate.swift` separado teria de ser registrado no Sources build phase do target, o que significa editar `project.pbxproj` na mão — risco real por ganho zero. O `Info.plist` referencia a classe por nome (`$(PRODUCT_MODULE_NAME).SceneDelegate`), e variável de build já é expandida ali, como o resto do arquivo mostra.

2. **`didFinishLaunchingWithOptions` deixou de criar a window.** Sob scenes a window pertence à scene, não à aplicação. O método agora só monta o `RCTReactNativeFactory` (uma vez por processo) e guarda as `launchOptions`; quem cria a `UIWindow(windowScene:)` e chama `startReactNative` é o `scene(_:willConnectTo:options:)`.

3. **Nada mais mudou no startup.** `startReactNative(withModuleName:in:launchOptions:)` já seta o `rootViewController` e chama `makeKeyAndVisible` — a troca é apenas de quem fornece a window.

**Primeira hipótese, errada, e por que vale registrar:** o Metro tinha morrido junto com a task de background que rodou o `yarn ios` (era processo filho dela), então a primeira leitura foi "build Debug sem bundle server". Subir o Metro destacado não resolveu — o que separou as duas causas foi o Metro não registrar **nenhum** request do device. Bundle server morto e crash nativo pré-bundle parecem iguais de fora; o log do Metro é o que distingue.

**Consequência operacional.** `yarn ios` disparado como task de background leva o Metro junto quando termina. Para verificação em simulador, subir o Metro destacado antes (`nohup npx react-native start &`) e só então buildar.

## 2026-10-03 — PRD 013: a paleta é do lojista, o que garante leitura é derivado

**Contexto.** A PRD 012 tornou o *conteúdo* de um lojista dele. A *aparência* continuava a um accent de distância de ser idêntica: `MerchantTheme` era `{ primaryColor }` e o `design.md` afirmava isso como contrato — "o accent é a única cor por lojista" — num app cujo arquivo de identidade levava o nome do primeiro cliente.

**Decisão.** `background`, `surface`, `text`, `textMuted` e `border` entram como override, ao lado do accent. O que **não** entra: `accentText`, que já era derivado, e `success`/`danger`, que carregam estado e não marca.

**O defeito que a PRD previu como hipótese e se confirmou.** Com fundo claro, o verde `mint` (`#3DDC84`) lê **1.68:1** — invisível. Trocar o verde base consertaria o Atlas e estragaria o Northstar, que a PRD exigia pixel-idêntico. A saída foi derivar: `success` e `danger` escolhem entre dois valores fixos conforme a luminância do fundo, exatamente o padrão que o `accentText` já usava. Northstar fica em `mint`/`ember`, Atlas recebe `moss`/`clay` a 4.73:1 e 5.13:1. Nenhuma superfície nova para o lojista quebrar — ele não escolhe cor de estado.

**Guard, não vistoria.** O tema estoura em `__DEV__` nomeando o par e a razão medida quando a cópia cai abaixo de 4.5:1 ou o estado abaixo de 3:1. Uma paleta falha ficando invisível, não estourando — então é medida, não olhada. Com 50 lojistas entrando sem desenvolvedor, screenshot não é gate que alguém roda.

**Uma expressão por token, nunca spread.** `{ ...colors, ...merchantConfig.theme }` aceitaria silenciosamente uma chave que o app não possui e leria um typo como token novo.

**Consequência.** A paleta base deixa de ser "a paleta do Northstar" e passa a ser o default que um lojista que não declara nada herda.

## 2026-10-03 — PRD 014: layout por lojista, com a mesma gramática dos blocos

**Contexto.** Cor sozinha não separa duas lojas: lado a lado, as duas Homes eram a mesma tela com outro tom. Faltava o arranjo.

**Decisão.** `merchantConfig.layout` declara uma escolha por seção, de um conjunto fechado: `featured` (`single` | `double`), `collections` (`inline` | `horizontal`), `detail` (`single` | `gallery`). Chave omitida cai no default, então o Northstar não declara nada e não mudou.

É a mesma linha dos blocos de conteúdo: **o app é dono da gramática, o lojista escolhe entre alternativas que o app sabe desenhar.** Os valores são união no código, não string vinda do config — arranjo que o renderer não desenha é erro de compilação. Foi a contenção que permitiu recusar a opção de layout livre: config descrevendo posição é um page builder, e aí o `design.md` deixa de ser contrato.

**Decisões técnicas.**

1. **Variante de componente é prop nomeada.** `CollectionCard` ganhou `variant: "row" | "tile"`. Enum fechado, não objeto de layout no call site — o `design.md` já antecipava isso no badge outline.

2. **`double` divide, não busca.** São os mesmos produtos em duas fileiras; contagem ímpar deixa o extra na primeira. Arranjo não é segunda query.

3. **Dois scrollers no mesmo eixo brigam.** No modo `horizontal`, a fileira de coleções é desenhada dentro do `ListHeaderComponent` e a lista empilhada recebe `data` vazia, em vez de aninhar um scroller horizontal dentro do vertical.

4. **Galeria com sincronia de mão única.** Escolher variante move o pager; arrastar o pager **não** muda a variante — mão dupla significaria um arrasto trocando calado qual tamanho vai para o carrinho. Variante cuja foto não está entre as do produto deixa a galeria onde está.

5. **A galeria só rende onde o catálogo tem foto.** Os produtos do Atlas têm **uma** foto cada, enquanto `northstar-essential` tem 6 e `everyday-tee` tem 4, acumuladas das passadas de restyle. Em catálogo de foto única ela degrada para imagem única sem indicador — correto, porém invisível. É fato de catálogo a pesar na hora de atribuir o valor, não regra que o código imponha. A query já pedia `images(first: 10)` e a tela usava uma — havia dado sendo buscado e descartado desde a PRD 002.

**Rótulo "Featured" removido.** O comentário `ponytail:` já admitia que não existe conceito Shopify por trás: eram os primeiros N do catálogo com nome de curadoria. Trocar por outra palavra manteria o problema; "Collections" ficou, porque é conceito real.

---

## 2026-10-03 — `Screen` é o container de toda tela, e o gutter mora nele

**Contexto.** Cada tela repetia o mesmo preâmbulo: `Box flex={1} backgroundColor="background" style={{ paddingTop: top }}`, `BackControl` montado à mão, bloco de título próprio, e `paddingHorizontal: 16` enfiado no `contentContainerStyle` da lista. Esse último detalhe era o defeito visível: com o gutter aplicado no container de conteúdo da `FlatList`, as linhas horizontais da Home terminavam 16pt antes da borda — o card sumia no meio do nada em vez de correr até a extremidade do aparelho.

**Decisão.**

1. **`src/components/Screen/Screen.tsx`** — safe area, background, gutter, back control e título em um lugar só. A tela declara o que quer por prop (`scrollable`, `gutter`, `title`, `eyebrow`, `onGoBack`, `floatingBack`) e compõe apenas o próprio conteúdo. Modelado no `Screen` do `bennu/food-balance`, sem o que este POC não tem: nada de `KeyboardAvoidingView`, header animado, imagem de fundo, `ScreenRef` imperativo ou estados de loading/erro — cada tela já resolve os seus.
2. **O gutter nunca vai no *frame* de um scroller.** No iOS um `ScrollView`/`FlatList` recorta no próprio frame: padding no `Box` que envolve a lista encolhe o frame, e aí o filho com margem negativa é cortado no gutter em vez de correr até a borda — foi exatamente o que aconteceu na primeira tentativa (card cortado a 48px = 16pt da borda, medido no screenshot). O gutter mora **dentro** do scroller: `Screen` o aplica no `contentContainerStyle` do próprio `ScrollView` quando `scrollable`, e a tela que traz a própria lista espalha `screenGutter` no `contentContainerStyle` dela. O `Screen` pada só o bloco de título.
3. **`sNegative16: -16`** entra na escala de spacing. É o gutter negado, não uma escala negativa livre: só `s16` ganha par. Quem precisa furar o gutter faz `marginHorizontal="sNegative16"` e reaplica `paddingHorizontal: 16` no `contentContainerStyle` — o primeiro card continua alinhado com a tela e o último rola até a borda real.
4. **`gutter={false}` é para a tela que abre em foto sangrada** (o detalhe), que então pada os próprios blocos de texto. Um filho isolado que precisa da borda usa o margin negativo; não desliga o gutter da tela inteira.

**Verificado no simulador em mãos** (iPhone 17, rota inicial temporária revertida): Home com as duas linhas horizontais correndo até a borda, lista 2 colunas com gutter, detalhe com galeria sangrada e back flutuante.

---

## 2026-10-03 — Reanimated entra, e o movimento vira token

**Contexto.** O app não tinha movimento nenhum: card aparecia pronto, toque não devolvia nada, o dot da galeria trocava de cor em corte seco. Pedido foi instalar `react-native-reanimated` e animar o app.

**Decisão.**

1. **`react-native-reanimated` 4.7.1 + `react-native-worklets` 0.13.0.** No RN 0.87 o worklets é pacote separado e peer obrigatório — não é dependência transitiva. O plugin canônico passou a ser `react-native-worklets/plugin`; `react-native-reanimated/plugin` hoje é só um reexport dele. Vai **por último** na lista de plugins, depois do `module-resolver`.

2. **O feedback de toque mora no `PressableBox`, não em cada card.** Todo elemento tocável do app já roteava por ele — card de produto, card de coleção (row e tile), chip de variante, back control. Uma dip de 3% num arquivo cobre os quatro; repetir `onPressIn` em cada chamador seria o diff maior e o que deixa um tocável de fora amanhã. `onPressIn`/`onPressOut` do consumidor continuam sendo chamados depois dos nossos.

3. **`src/theme/motion.ts` — duração e curva são token, pelo mesmo motivo que cor é.** Card entrando em 260ms ao lado de card entrando em 500ms lê como bug, não como variedade. Dois presets, só: `cardEnter` (fade + sobe 25pt) e `resize` (mudança de tamanho/posição entre renders).

4. **`AnimatedBox` exportado do `Box.tsx`.** View animada continua falando em token de restyle (`backgroundColor="accent"`, `borderRadius="s2"`) em vez de cair para `style={{}}` só porque ganhou `entering`/`layout`. Usado no `StoryCard` e no dot da galeria.

5. **Tipagem: `AnimatedProps<T>` alarga toda prop para "ou um shared value"**, o que torna `onPressIn` não-chamável. Os handlers voltam de `PressableProps` por `Omit` + `Pick`; sem isso só sai cast.

**Armadilha — Metro lê `babel.config.js` uma vez, na subida.** Com o dev server já rodando desde antes do plugin existir, o bundle veio sem a transformação de worklet e o app abriu em tela vermelha: `[Worklets] Unpackers were compiled...` / `Cannot read property 'bytecode' of undefined` em `NativeWorklets.native.ts:444`. O erro se parece com build nativo quebrado — fala de bytecode, unpacker e stack nativa — mas é cache de bundler: `yarn start --reset-cache` resolve sozinho. **Instalar dependência com worklet = reiniciar o Metro, sempre.** Rebuild nativo não cobre isso.

**Verificado no simulador em mãos** (iPhone 17, o que já estava de pé): app sobe sem tela vermelha, e a gravação do launch a 15fps pega o frame intermediário — fotos lavadas, títulos ainda cinza, preços ainda fora — contra o frame assentado. Entrada de card está rodando. Dip de toque e dot da galeria ficaram verificados só pelo caminho de código: exigiriam input sintético, que é proibido aqui.

---

## 2026-10-03 — Lottie no loading do detalhe, e o fill repintado em JS

**Contexto.** O estado de loading do `ProductDetail` eram duas linhas de texto parado. O usuário trouxe o asset pronto (`src/assets/animations/loading.json`) e pediu para ligar ali.

**Decisão.**

1. **`lottie-react-native` 7.5.0 entra como dependência nativa.** Reanimated já estava instalado e cobriria uma entrada de fade/scale sem pod novo, mas o pedido era tocar um documento Lottie — e isso exige um renderer Lottie. Alternativa foi oferecida e recusada.

2. **O fill é repintado em JS (`src/theme/lottieTint.ts`), não pelo `colorFilters` nativo.** O asset vem preenchido de preto, que some no fundo quase-preto da base; e o accent só existe em runtime, por lojista. O `colorFilters` casa camada por **keypath** — aqui, nomes em cirílico que o designer exportou do After Effects. Reescrever `{ ty: "fl" }` no documento funciona independente de como as camadas foram nomeadas. Reusa `toChannels` do `contrast.ts` (que já devolve canais 0–1, o formato que o Lottie quer) em vez de reimplementar parse de hex — por isso o helper mora no módulo `theme`, não em `utils`.

3. **`@assets` vira alias de verdade** (babel + tsconfig + `pathGroups` do `import/order`), com barrel em `src/assets/index.ts`. Sem isso o único acesso ao asset era caminho relativo fundo, que a quick-rule #10 proíbe.

4. **O recorte da arte é medido, não chutado.** A arte é um canvas 1000×1000 com os três quadrados numa faixa fina (x 190–801, y 440–559) — ~85% é vazio. `resizeMode="cover"` numa caixa baixa corta o vazio vertical; o vazio horizontal que sobra é parelho dos dois lados (190 contra 199), então centralizar a caixa centraliza os quadrados.

5. **O bloco de loading é centralizado; o de erro continua no gutter.** São coisas diferentes: loading é uma mensagem, erro é uma coluna de ações. A centralização mora no `Box` do ramo de loading, não no container que os dois compartilham. Sobra um detalhe da própria arte: em repouso a faixa fica ~8pt à esquerda do centro e em movimento ~7pt à direita — o desenho oscila em torno do centro do canvas ao longo do loop, e compensar uma das poses pioraria a outra.

**Armadilha — o build iOS quebrou no pod, não no JS.** `lottie-ios` gera um bundle de privacy-info declarando `IPHONEOS_DEPLOYMENT_TARGET` 13.0, abaixo do piso de 15.0 do Xcode atual: `xcodebuild` sai com 65 e a mensagem aponta um target do projeto `Pods`, não o app. O `post_install` do Podfile agora sobe qualquer target abaixo de `min_ios_version_supported` — relativo ao piso do projeto, não um número fixo, para continuar valendo quando o piso subir.

**Verificado no simulador em mãos** (iPhone 17, rota inicial temporária + `isLoading` forçado, ambos revertidos e app reiniciado): nos dois lojistas — volt sobre quase-preto no northstar, `#F04E23` sobre creme no atlas — com 16 capturas distintas seguidas confirmando que a animação roda, e o primeiro quadrado alinhado ao gutter.

---

## 2026-10-03 — O warning de package exports é bug do próprio React Native

**Contexto.** Todo bundle imprimia `Attempted to import the module ".../react-native/src/private/featureflags/ReactNativeFeatureFlags" which is not listed in the "exports"`. Parecia dependência de terceiro importando interno da RN.

**Decisão.** Não é terceiro: `@react-native/virtualized-lists@0.87.1` — pacote da própria React Native, versão casada — importa esse subpath, e o `exports` do `react-native@0.87.1` não o declara. Não há nada do app nem de lib instalada no caminho. Ainda não declarado no `0.88.0-rc.3`, então esperar release não é caminho, e subir major de RN por um warning cosmético é desproporcional.

`metro.config.js` resolve **esse especificador exato** direto para o arquivo, pulando o lookup de exports que gera o aviso. Descartado: `unstable_enablePackageExports: false` (desliga exports para todo pacote, muda semântica de resolução do projeto inteiro) e `patch-package` (devDep + postinstall para um aviso). O comentário no arquivo carrega a condição de remoção — quando o `exports` do `react-native` cobrir `./src/private/*`.

**Verificado por bundle limpo** (`react-native bundle --reset-cache`, iOS, dev): 1 warning antes, 0 depois, e os dois bundles saem com **md5 idêntico** — a resolução não mudou, só o caminho que emitia o aviso.

---

## 2026-10-03 — Variação de lojista é um mapa de telas e áreas, não uma lista plana de blocos

**Contexto.** A PRD 012 trocou flags por uma lista plana: `blocks: ContentBlock[]`, cada bloco carregando `slot` e `order`. Lendo o config do northstar não dava para responder "o que aparece na linha de badges?" sem varrer os seis blocos e cruzar `slot` com `order` na cabeça. Pior: dois eixos de posicionamento (`slot`, `order`) configurados item por item quando posicionamento é propriedade do grupo.

**Decisão.** `screens: MerchantScreens` — uma chave por tela, e dentro dela uma chave por **área** que aquela tela desenha:

```ts
screens: {
  productDetail: { badgeRow: [...], underPrice: [...], aboveDescription: [...], belowDescription: [...] },
  home: { footer: {...} },
}
```

- **O caminho de chaves é o lugar**, então nenhum bloco carrega `slot`.
- **O índice do array é a ordem**, então nenhum bloco carrega `order` — `byOrder`/sort saiu junto.
- **O tipo do elemento é o que a área aceita**: `badgeRow?: BadgeBlock[]`, `underPrice?: TextLineBlock[]`, `belowDescription?: (TextLineBlock | LabelValueBlock)[]`. Substitui a união discriminada que pareava `kind` com `slot` — a contenção agora é o próprio tipo da área, e o erro do compilador aponta a chave errada em vez de uma união inteira.
- **`home.footer?: StoryBlock`** é bloco único, não lista: o rodapé da Home desenha um card. Antes era `blocks.find(isStoryBlock)`, que descartava um segundo story em silêncio.

**"Área", nunca "seção".** Primeira volta nomeou as posições de `sections`, e colidiu de frente com o que o projeto já chamava de seção: o kind `labelValueSection` e o componente `ProductSection`. Uma seção é algo que se coloca *dentro* de uma área. Mesma razão pela qual o prefixo `detail` sumiu das chaves — `content.detailBelowDescription` repetia a tela em cada nome em vez de agrupá-la; aninhar por tela diz qual é a tela uma vez só.

**Opcional é a chave ausente, e é o mecanismo inteiro.** Nada de `required`/`optional` declarado: área que o lojista não preenche não existe no literal, não resolve bloco nenhum e não rende nada — a regra #5 de sempre, agora visível na forma do config. O atlas exercita isso sem `belowDescription` e sem `home`.

**Ordem *entre* áreas continua sendo do app.** As áreas do detalhe são definidas contra conteúdo fixo (sob o preço, acima/abaixo da descrição), então a tela as coloca; o lojista ordena o que está *dentro*. Dar ordem entre áreas exigiria colapsar os três ancoradouros do detalhe num só, com `description` virando um `kind` posicionável — mudança de tela e de grammar, não de config.

**Consequências no código.** `productDetailAreas: ProductDetailAreaBlocks[]` (pares `[área, blocos]`, em ordem de declaração) substitui `productBlocks` pré-ordenado como o que o adapter percorre; `productMetafieldBlocks` sobrou achatado só para os identificadores do fragment; `storyBlock` virou `homeFooterStory`. O adapter virou dois `for` aninhados e perdeu a leitura de `block.slot`. `ProductSlot` saiu do domínio — `ProductContent` indexa por `ProductDetailArea`, que vem do config. Separar `home` de `productDetail` matou o `const { homeFooter, ...resto }` que filtrava o story antes de percorrer.

**Custo de um conceito novo não mudou:** uma entrada de array. Só ficou óbvio em qual array.

**Verificado no simulador em mãos** (iPhone 17, rota inicial temporária, revertida): Northstar Essential com as três áreas na ordem declarada — `BEST SELLER` + `WINTER COLLECTION`, "Organic Cotton" + "Free shipping above $199", "HOW TO CARE" — e Cotton Cap, sem metafield nenhum, sem rastro: nem título, nem divisória, nem vão.

---

## 2026-10-03 — Animação de layout e feedback de toque na mesma view se atropelam

**Decisão:** quando o `PressableBox` recebe `entering`/`exiting`/`layout`, ele mesmo embrulha o pressable num `AnimatedBox` e passa a animação para o wrapper. Nenhum caller muda.

**Causa.** O press scale vive num `useAnimatedStyle` que escreve `transform`; `FadeInDown` escreve `transform` também. O Reanimated avisa em runtime ("Property 'transform' of AnimatedComponent(Pressable) may be overwritten by a layout animation") e manda embrulhar — `ProductCard` e `CollectionCard` (row e tile) passavam `entering={motion.cardEnter}` direto no tocável.

**Por que no `PressableBox` e não nos cards:** é o ponto por onde todo tocável já roteia (quick-rule #12). Corrigir nos dois callers deixaria o terceiro quebrado no dia em que aparecer.

**Como apareceu:** toast amarelo de LogBox nas capturas de tela do README — warning de JS não sobe pro log nativo do simulador, então foi preciso um hook temporário de `console.warn` postando pra um sink HTTP local (`index.js`, revertido) pra ler a mensagem. Fica o método: screenshot limpo é gate de defeito, não cosmético.

**Verificado no simulador em mãos:** Northstar (home com duas fileiras + tiles, grid 2 colunas) e Atlas (home com fileira única + banners) sem toast e sem mudança de layout do card.

---

## 2026-10-03 — Troca de loja em runtime: afordância de demo, com o custo contido

**Decisão:** o app passa a trocar de lojista em runtime, por um controle na linha do título da Home que abre um diálogo explicando que isso não é comportamento de app real e oferece as lojas declaradas. Existe por causa do APK: quem baixa não vai recompilar com outro `.env` pra conferir a tese do README.

**O que a troca obriga.** O id ativo virou estado mutável (`config/merchant/activeMerchant.ts`, `useSyncExternalStore`), e com isso **nada derivado do lojista pode ser constante de módulo** — `merchantConfig`, `merchantLayout`, `productDetailAreas` e `homeFooterStory` viraram funções, e `theme` virou `buildTheme()`. O root remonta com `key={merchantId}`: remontar é o que derruba a pilha de navegação e o estado local das telas, que é o "abrir o app de novo" pedido.

**A exceção, e por que ela é segura.** O documento GraphQL é template literal montado uma vez no import — não dá pra torná-lo função sem transformar fragment e query em funções em cinco arquivos. Então `queriedMetafieldBlocks` passa a ser a união dos blocos de **todos** os lojistas declarados. O adapter já indexava por `namespace:key` e resolve só os blocos do lojista ativo; identificador que o produto não define volta `null` e é descartado. Teto: os 250 identificadores por query da Shopify — passando disso, documento por lojista.

**Cache e credenciais.** `queryKey` não carrega o lojista, então o catálogo da loja anterior seria servido do cache pra nova e o `staleTime` o manteria lá: a troca chama `queryClient.clear()` antes de mudar o id. E valida as credenciais **antes** de trocar — faltando chave, `merchantConfig()` estoura durante o build do tema, que num release é app morto em vez de mensagem; agora é um alerta e a troca não acontece.

**O diálogo é tela do app, não `Alert` do sistema.** A primeira volta usou `Alert.alert` — zero código, e feio: tipografia do sistema, botões empilhados, nenhuma relação com a marca que a tela ao lado está provando que existe. O diálogo agora é `Modal` transparente com card em `surface`, scrim no `background` do próprio lojista a 0.94 (a tese é "o app muda de marca inteira" — um scrim preto fixo a contradiria no atlas claro), e a loja **não** ativa é a preenchida em accent: o elemento alto é a ação, não o estado. Erro de credencial virou linha em `danger` dentro do card, não um segundo alerta. Fica legível nas duas paletas e sem teto de três botões.

**A status bar é derivada do fundo do lojista**, com o mesmo `isLight` que já decide `accentText` e os estados: fundo claro pede glifo escuro, e no atlas a barra branca sumia no creme. `backgroundColor` da `StatusBar` ficou de fora de propósito — é deprecada no Android com edge-to-edge e o aviso apareceria justo no APK.

**Ícone sem dependência:** três pontos desenhados com `Box`. Glifo de engrenagem em `Text` renderiza como emoji colorido em parte dos Androids — defeito garantido justo no APK que motivou a feature.

**Verificado no simulador em mãos** (iPhone 17, efeito temporário no lugar do toque, revertido): diálogo com `NORTHSTAR (current)` e `ATLAS`; escolhendo atlas o app reabre em creme com o catálogo de linho; detalhe do atlas resolve `fabric_type` e `fit_guide` (identificadores que o northstar não declara) com o fragment compartilhado. Cold start limpo volta no northstar, sem LogBox.

---

## 2026-10-03 — O flash branco entre telas no Android é a janela, e quem tapa é o root do app

**Decisão:** o `Router` embrulha o `NavigationContainer` num `Box flex={1} backgroundColor="background"`. `android:windowBackground` fica como está.

**Causa.** O `react-native-screens` dá os primeiros frames da tela entrando antes do React ter pintado ela; o que estiver atrás aparece. Toda a cadeia de ancestrais em JS era transparente (`SafeAreaProvider` e `NavigationContainer` não pintam), então atrás havia a janela do Android — `Theme.AppCompat.DayNight.NoActionBar` em aparelho no modo claro, isto é, branco. `contentStyle` e o tema do `NavigationContainer` já estavam certos e não alcançam esse frame: eles pintam a tela, não o que está atrás dela.

**Por que não `styles.xml`:** o background é do lojista e é escolhido em runtime (troca de loja) — ink no northstar, creme no atlas. Cor fixa no recurso nativo troca um flash errado por outro. O root em JS é o único lugar que conhece o tema ativo e está atrás da pilha inteira.

**Como foi isolado:** `screenrecord` + frames do push. Antes, o frame da transição subia a luminância média (67,9 → 69,1) com uma faixa branca na área da tela entrando. Com o aparelho forçado em modo escuro (`cmd uimode night yes`, sem rebuild) a mesma faixa saiu cinza-escura — isso é o que provou ser a janela, e não o `contentStyle`.

**Fica de fora:** o cold start ainda mostra a janela branca por um frame antes do bundle subir. É o mesmo mecanismo mas não tem tema ativo ainda; resolver exige escolher uma cor fixa no `styles.xml`.

**Verificado no emulador em mãos** (`sdk_gphone16k_arm64`, modo claro): push Home→detalhe, push Home→coleção e o pop de volta, sem faixa branca em nenhum frame — a luminância média cai monotônica em vez de dar o pico.

---

## 2026-10-03 — A linha de produtos da Home não se chama "featured", e o nome dela é do lojista

**Decisão:** `layout.featured` virou `layout.productRow`, e o título visível da linha é `screens.home.productRow`, uma string. Northstar declara `"Products"`; atlas não declara e a linha roda sem cabeçalho. Nenhum dado novo vem da loja.

**Por quê.** "Featured" afirmava curadoria que não existe: a linha é `products.slice(0, 6)` da query de catálogo, sem `sortKey` e sem collection por trás. O nome do campo era a única parte do app que mentia sobre a origem do dado. Renomear custou 5 arquivos; implementar curadoria de verdade (collection handle no config, ou `compareAtPrice` para virar linha de ofertas) custaria query + adapter + seed, e ninguém pediu.

**Por que o título é string e não bloco.** As outras áreas de `screens` são listas de blocos porque o conteúdo delas vem de metafield. Aqui o conteúdo é o próprio catálogo — só o nome é do lojista. Bloco com `source` seria modelar um campo que não tem fonte. Chave ausente = sem cabeçalho, igual ao resto do mapa de áreas.

**Efeito de layout:** o título ocupa a esquerda da linha que já tinha o link à direita (`justifyContent` alterna `space-between`/`flex-end` conforme o título existir). O link virou **See all** — com "Products" à esquerda, "All products" à direita lia como duplicata.

**O `ponytail:` continua:** o teto não mudou — a linha ainda é os primeiros N do catálogo, e o upgrade segue sendo um handle de collection no config no dia em que um lojista curar uma.

---

## 2026-10-06 — PRD 015: o checkout saiu do "fora de escopo", e o carrinho é o da Shopify

**Decisão:** o app passa a ter carrinho e checkout em dev mode. O carrinho é o da Storefront Cart API (`cartCreate`/`cartLinesAdd`/`cartLinesUpdate`/`cartLinesRemove`), e o checkout é o `cart.checkoutUrl` aberto numa WebView. Reimplementar contato, entrega ou pagamento continua fora.

**Por quê.** A linha do README dizia que reimplementar o checkout não prova nada sobre customização de lojista — e isso segue verdade. O que mudou foi o pedido: o usuário quis o fluxo de compra. Usar a página da Shopify mantém o argumento de pé e ainda evita a única coisa que um POC não pode fazer, que é segurar dado de cartão.

**Todo número do carrinho é da loja.** `cost.subtotalAmount` e `cost.totalAmount` por linha vêm da resposta; o device não soma nada. Carrinho local teria transformado cada valor numa afirmação que a loja nunca verificou.

**Medido antes de escrever a PRD** (northstar-poc, 2026-10-06): criar com 2 un. → subtotal 598.00 USD, `userErrors: []`; atualizar para 1 → 299.00; remover → 0.0; id de carrinho inexistente → `cart: null`; variante inválida → `userErrors` preenchido com `cart: null`. Os dois caminhos de falha são os que o service converte em `ShopifyError`.

---

## 2026-10-06 — A página de senha da dev store não se vence com senha na URL, e o `curl` mentiu sobre isso

**Decisão:** a WebView do checkout **submete o formulário** de `/password` antes de carregar o `checkoutUrl`, com a senha vinda do `.env` por lojista (`{MERCHANT}_STORE_PASSWORD`). Chave ausente = nenhum passo de pré-login, e loja sem senha roda pelo mesmo caminho.

**Por quê.** Loja de desenvolvimento não deixa desligar a senha sem plano pago — o toggle "Modo privado" já estava desligado e a loja continuava barrando. O `checkoutUrl` sem cookie termina em `/password`.

**O erro que o teste de controle pegou.** Em `curl`, semear a sessão com qualquer requisição (`/`, `/password`, `/products.json`) abria o checkout — e **com senha errada também**. A conclusão "basta uma navegação de aquecimento" chegou a entrar na PRD e foi revertida: num Chromium de verdade, perfil limpo, o `checkoutUrl` cai em `/password` e só o formulário submetido abre a página (checkout renderizado, com Contact, Delivery, Payment e total 299 USD). Conclusão que só vale no `curl` não é conclusão sobre WebView.

**Gateway:** "Gateway de pagamento de teste" (o antigo Bogus Gateway, renomeado — buscar por "bogus" não acha nada) ativado nas duas lojas. Cartão `1` aprova, `2` recusa, `3` falha no gateway. Shopify Payments test mode não serve: exige setup completo em plano pago.

---

## 2026-10-06 — Persiste só o id do carrinho, e a chave carrega o lojista

**Decisão:** `activeCart.ts` guarda o id em MMKV (`react-native-mmkv` 4 + `react-native-nitro-modules`, peer obrigatório) sob `cart:{merchantId}`. Nada mais vai pro disco.

**Por quê.** O id é um token de capacidade de **um** carrinho — quem o tem lê e altera aquele carrinho e nada além —, não uma credencial da loja. É por isso que ele pode ficar em disco enquanto o token de Storefront não pode. Linhas, preços e totais sempre voltam da Shopify.

**Chave por lojista em vez de limpar na troca.** A chave carrega o `merchantId`, então trocar de loja troca de carrinho em vez de apagar um para criar outro — nenhum vazamento entre lojas, e nenhum passo extra no `MerchantSwitch`. Carrinho que a Shopify já derrubou volta `null`: o hook esquece o id e o próximo add cria outro, em vez de abrir numa tela morta.

**Isso altera `security.md`**, que dizia "nada é persistido". Agora diz exatamente o que é, e por que esse um pode.

---

## 2026-10-06 — Aviso de dev mode é portão, não rodapé — e a copy é do app

**Decisão:** tocar em "Checkout" abre um diálogo antes de qualquer navegação: diz que é loja de desenvolvimento, que o pedido é real e o pagamento não, e lista os cartões de teste. Continuar abre o checkout; cancelar volta ao carrinho intacto. Aparece toda vez.

**Por quê.** Quem recebe a demo não tem outro lugar para descobrir que o pagamento é simulado nem o que digitar no campo de cartão — e é sempre outra pessoa, então "uma vez por sessão" falharia justamente no primeiro uso de cada um.

**Copy do app, não do lojista.** Dev mode é propriedade do build, não vocabulário de loja: nada disso passa por `config/merchant/`. Tratar como conteúdo de lojista teria quebrado a regra que o projeto inteiro sustenta.

**Três componentes compartilhados nasceram aqui:** `Button` (o primeiro do repo), `Dialog` — extraído do `MerchantSwitchDialog`, que passou a usá-lo — e o slot `footer` do `Screen`, com a altura medida por `onLayout` e somada ao `paddingBottom` do scroller, nunca por constante.

---

## 2026-10-06 — Estoque já é real; o que faltava era mostrar o teto

**Decisão:** a linha do carrinho carrega `stockLimit`, vindo de `merchandise.quantityAvailable`, e o `+` desabilita ao chegar nele, com a legenda "All N in stock". Nenhuma validação de quantidade foi escrita no app.

**Por quê.** A Shopify já aplica o teto e **não** devolve erro: pedir 25 de uma variante com 10 devolve `userErrors: []` e um carrinho com 10 (medido). Sem mostrar isso, o `+` parecia quebrado em vez de esgotado — o defeito era de interface, não de regra.

**Zero não é zero.** `quantityAvailable: 0` significa tanto "acabou" quanto "não contado": a Boxy Tee da northstar tem `totalInventory: 0` com `availableForSale: true` nas três variantes, e a atlas inteira roda assim. Por isso só uma contagem **positiva** vira teto — tratar 0 como limite teria bloqueado o carrinho de uma loja que vende sem rastrear estoque. Mesma leitura da ADR de 2026-10-01 ("disponibilidade por rastreamento de inventário, não quantidade"), agora do lado da quantidade.

**Medido** (northstar, com o documento do próprio projeto): variante rastreada, pedido 25 → carrinho 10, `stockLimit` 10, `+` desabilitado; Boxy Tee, pedido 17 → carrinho 17, `stockLimit` ausente, `+` livre. O 17 do print é a loja permitindo, não o app ignorando.

**Quantidade no detalhe (mesmo dia).** A tela de detalhe ganhou stepper e o CTA passa a adicionar a quantidade mostrada. O stepper virou `components/QuantityStepper` — o carrinho tinha um local e agora os dois usam o mesmo, com `min` 0 no carrinho (decremento no 1 é remoção) e 1 no detalhe. O teto é o `stockLimit` da variante selecionada, que entrou em `ProductVariant` pela mesma regra do carrinho: só contagem positiva vira limite. Trocar de variante ou concluir um add volta a quantidade para 1.

**Teto do detalhe é estoque menos carrinho (mesmo dia, defeito achado em uso).** O CTA dizia "Added to cart" mesmo quando a Shopify não adicionava nada, porque o carrinho já estava no limite da variante: o corte vem sem erro e o app anunciava o pedido, não o resultado. Agora o rodapé lê o carrinho (`useCartGetDetail`, já em cache pelo botão da Home), o teto do stepper é `stockLimit − quantidade já no carrinho`, o CTA desabilita quando sobra zero, e a mensagem é calculada pela **diferença** entre o carrinho que voltou e o anterior: adicionou tudo → "Added to cart"; adicionou menos → "Added N — that is all the stock"; adicionou nada → mensagem de erro. Medido: carrinho em 10/10 + pedido de 3 → `userErrors: []` e 0 adicionados; carrinho em 8 + pedido de 5 → 2 adicionados.

**Carrinho é afordância do container, não de cada tela (2026-10-06).** O `CartButton` saiu de `HomeScreen/components` para `components/`, navega sozinho (`useNavigation` + import **type-only** de `@routes`, que não cria ciclo) e é o `Screen` que o desenha: na linha do título quando existe uma, e flutuando à direita — oposto ao back — quando a tela abre em foto sangrada (`floatingBack`). `cartAction={false}` desliga nas telas que já são o carrinho ou estão depois dele. Uma tela nova ganha o controle sem fazer nada, que é a diferença entre container e convenção. A legenda "All N in stock" foi para a linha de baixo na linha do carrinho: ao lado do stepper ela encostava no preço.

**Mensagem de WebView é entrada não confiável (2026-10-06, defeito em uso).** A tela de resultado mostrou `{"checkout_completed":true}` no lugar do número do pedido: o `onMessage` tratava qualquer mensagem como a nossa e renderizava o payload cru. A própria página de checkout da Shopify fala nesse canal. Agora a mensagem é parseada com try/catch, só `source: "fuego-checkout"` carrega referência, a referência precisa casar `#\d{3,}` (string livre vira ausente, e ausente não renderiza nada), e `checkout_completed: true` da Shopify serve só como sinal de conclusão, sem referência. Mesma regra do metafield JSON do lojista, agora para o canal da WebView.

**E a conclusão virou polling.** O script injetado rodava uma vez por load, mas o checkout é documento único: chegar no "thank you" não dispara load novo, então ele nunca rodava lá — o que de fato tirava o app da tela era a mensagem da Shopify. O script agora instala um intervalo de 500ms que vigia a URL e posta uma vez. Verificado com 12 asserções sobre o parser e a allowlist de host, incluindo a string exata que vazou e uma mensagem com `source` forjado.

---

## 2026-10-06 — Layout mora dentro da tela, não num mapa à parte

**Decisão:** `merchantConfig.layout` deixou de existir. Cada tela declara o seu arranjo como **primeira chave** do próprio bloco, antes das áreas: `screens.home.layout = { productRow, collections }` e `screens.productDetail.layout = { media }`. `merchantLayout()` virou `homeLayout()` e `productDetailLayout()`, cada uma resolvendo os defaults da sua tela. `detail: "single" | "gallery"` virou `media`, porque dentro de `productDetail` a chave `detail` não dizia nada.

**Por quê.** O mapa plano exigia que todo arranjo novo fosse registrado num lugar que conhece todas as telas de uma vez — e vêm mais telas. Com a chave dentro da tela, uma tela nova chega inteira: como desenha e o que desenha, lido no mesmo lugar. A declaração de um lojista passa a ser uma lista de telas, e nada mais.

**Consequência no código:** `declaredAreas()` filtra `layout` antes de caminhar pelas áreas — é a única chave da tela que não é área, e nada abaixo precisa saber disso. Filtrado por chave, não por destructuring com rest: a config de lint copiada do `food-balance` rejeita o binding descartado, e listar as áreas na mão quebraria a cada área nova.

**Axes do README caíram de quatro para três** (credenciais, paleta, mapa de telas): layout não é mais um eixo, é o que a tela diz antes de dizer o conteúdo.

**Defeito pego na verificação:** mover o `layout` do northstar sem levar `productRow`/`collections` para `screens.home` derrubou a Home dele para o arranjo base — uma linha só e coleções empilhadas. O print do simulador foi o que mostrou; `tsc` e lint estavam limpos, porque chave ausente é arranjo base por construção.

---

## 2026-10-07 — A conclusão do checkout não pode depender de evento de navegação

**Defeito em uso:** o redirect para a tela de resultado falhava de forma intermitente — o app ficava parado na página da Shopify depois do pedido fechado. O portão era `isCompletionUrl(currentUrl)`, e `currentUrl` só é atualizado por `onNavigationStateChange`. O checkout é documento único: quando a tela de obrigado chega por transição no cliente, o evento não vem, o `currentUrl` continua sendo o do checkout e a mensagem de conclusão é descartada. Pior: o script postava **uma vez só** (`sent = true`), então quando a mensagem caía nessa janela ela estava perdida para sempre.

**Decisão:** o portão passa a julgar a mensagem por `event.nativeEvent.url` — a leitura que a própria WebView faz da página no momento do post, que a página não pode forjar — submetida aos dois testes de sempre, `isStoreUrl` e `isCompletionUrl`. A URL rastreada por evento de navegação saiu do código junto com o state que a guardava: ela não servia para isso. O intervalo de 500ms também deixou de travar depois do primeiro envio: repete enquanto a página estiver na URL de conclusão, então uma mensagem que caia numa janela ruim é reenviada em vez de sumir.

**Descartado:** mandar `window.location.href` dentro do payload. Era dado da página, forjável como a referência, e trocava um portão quebrado por um portão decorativo — `nativeEvent.url` dá a mesma informação pelo lado nativo, de graça. Pego pela revisão de segurança automática antes de sair da sessão.

**Verificado** com asserções sobre o portão (conclusão legítima na página de status passa; página de checkout, host estrangeiro e `href` declarado no payload continuam recusados; `checkout_completed` cru nunca vira referência) e com o script injetado parseado como JS.

---

## 2026-10-07 — `underPrice` virou `textLines`

**Nome mentia sobre a posição:** a tela empilha preço → `badgeRow` → `underPrice`, então o que fica logo sob o preço é a fila de badges, não a área chamada `underPrice`. O print do detalhe mostrou isso: `BEST SELLER` / `WINTER COLLECTION` entre o `$299` e o `Organic Cotton`.

**Decisão:** a área passa a se chamar `textLines` — nomeada pelo que aceita, como `badgeRow`, em tipo, configs dos dois lojistas, tela, README, template e `standards/shopify.md`. Com isso a regra de nome ficou explícita no standard: **área se nomeia pelo que aceita ou por conteúdo fixo (descrição), nunca por outra área**.

**Descartado — `underBadges`,** que foi o primeiro corte desta mesma sessão: trocava uma posição errada por uma posição frágil. Badge é bloco de lojista, e lojista que não compra badge deixa `badgeRow` ausente — o nome perderia o referente. `aboveDescription`/`belowDescription` seguem posicionais porque descrição é campo do produto, não área.

**Verificado** por `tsc --noEmit` e `eslint` limpos: nenhuma camada indexa área por string — `declaredAreas()` caminha por `Object.entries`, então a troca foi só de nome.

---

## 2026-10-07 — `media`: `single` saiu, `filmstrip` e `stack` entraram

**`single` não era um arranjo, era a ausência de um.** Uma foto de capa é o que `gallery` já faz quando o produto tem uma imagem só — o lojista não estava escolhendo entre dois desenhos, estava escolhendo entre o desenho e a versão degradada dele. Os dois lojistas declaravam `gallery`, o que deixava o eixo sem demonstração.

**Decisão:** `media` passa a ser `gallery` | `filmstrip` | `stack`, base `gallery` (era `single`).

- `gallery` — uma foto por vez, paginada por swipe, com indicadores. Inalterado.
- `filmstrip` — uma hero escolhida numa fita de thumbnails sob ela. Mesmo sync de mão única da galeria: a variante move a hero, o toque na thumb nunca move a variante.
- `stack` — todas as fotos full-bleed, empilhadas, rolando com a página. Não tem `activeUrl`: nada está escondido, então não há para onde paginar.

A tela deixou de ter o ternário e o `<Image>` solto: `ProductMedia` resolve o arranjo e é **o único** lugar que trata produto sem foto — o placeholder saiu de `ProductGallery`, que era o único caller dela. `atlas` passou a `filmstrip`, então o eixo virou linha na tabela dos dois lojistas no README.

**Descartado — `mosaic`** (primeira foto full-bleed + grid de 2 colunas): é o `stack` com cálculo de layout em cima e nenhuma leitura nova; três arranjos já cobrem swipe, escolha e rolagem.

**Verificado** por `tsc --noEmit` e `eslint` limpos, e pelo switch exaustivo em `ProductMedia` — um valor novo na união não compila até ganhar seu `case`.

---

## 2026-10-07 — `productRow` ganha `carousel`, e o eixo passa a resolver por switch

**Decisão:** `home.layout.productRow` passa a ser `single` | `double` | `carousel`, base `single`.

- `carousel` — um produto por página, largura do device, paginado por swipe, com indicadores. Mesmos produtos que os outros dois arranjos desenham: `double` divide, `carousel` pagina, nenhum dos dois busca mais nada.

O arranjo saiu do `HomeHeader` e virou `HomeProductRow`, pelo mesmo motivo que `ProductMedia` nasceu no detalhe: com três valores, a cadeia de `===`/`!==` deixa um quarto valor cair silenciosamente no ramo do vizinho, enquanto o `switch` exaustivo não compila até o `case` novo existir. O `HomeHeader` voltou a ser só cabeçalho (título, "See all", estados de carga e as coleções).

A página do carrossel tem a largura do device: a gutter é cancelada no frame e reaplicada por página, senão o `pagingEnabled` para uma gutter antes do card. Um produto só não é carrossel — o scroll é desligado, como na `ProductGallery`, para não dar rubber-band como se uma segunda página tivesse falhado.

O carrossel anda sozinho quando o caller passa `autoScroll` — `HomeProductRow` passa, é o único. Um `setTimeout` por página, não um `setInterval`: `page` também se move no swipe, e o timeout reagendado reinicia a espera de onde o carrossel realmente está. O primeiro toque (`onScrollBeginDrag`) desliga o avanço **em definitivo** — timer que volta briga com a mão na tela — e `useReducedMotion` do reanimated desliga antes de começar.

**Verificado** por `tsc --noEmit` e `eslint` limpos e no simulador já aberto, nos três arranjos (`carousel`, `single`, `double`), e o avanço automático por screenshots em sequência (página 3 → 5 em 8s), revertendo a config ao fim.

---

## 2026-10-07 — `stack` sai de `media`: o eixo volta a dois arranjos

**Decisão:** `productDetail.layout.media` passa a ser `gallery` | `filmstrip`, base `gallery`. `stack` cai — nenhum lojista o declarava, então o valor custava um `case`, um componente e uma linha em três documentos sem demonstrar nada.

Pelo mesmo argumento que derrubou `single` e `mosaic`: o eixo se justifica pela leitura que cada arranjo oferece, não pela quantidade de opções. `gallery` e `filmstrip` cobrem swipe e escolha; rolar a página já é o que a tela faz.

O switch de `ProductMedia` segue exaustivo — a união com dois valores continua recusando compilação se um terceiro aparecer sem `case`.

**Verificado** por `tsc --noEmit` e `eslint` limpos.

---

## 2026-10-07 — `BrandStory` vira o domínio `Metaobject`, e `story` passa a ser bloco de qualquer área

**Decisão:** o domínio deixa de se chamar pelo tipo de metaobject de um lojista (`brand_story`) e passa a se chamar pela fonte: `src/domain/Metaobject/`. `story` vira um `kind` como os outros — `ContentBlocks` desenha, e toda área que aceita seção aceita story: `home.header`, `home.footer`, `productDetail.aboveDescription` e `belowDescription`. `home.footer` deixou de ser um bloco único e virou lista.

**Coletar "todos os metaobjects da loja" só existe dentro do que o lojista declara.** A Storefront não lista definições de metaobject — `metaobjects(type:)` exige um tipo, e enumerar definições é Admin API, token de servidor que o app não pode ter. Então o eixo é: um bloco `story` = um tipo, e **toda entrada daquele tipo vira uma seção** (`first`, base `METAOBJECT_PAGE_SIZE = 10`). Três brand stories cadastradas na admin desenham três seções, sem deploy.

**O modelo resolvido saiu do `Product`.** Uma área mistura fontes — o badge vem de metafield do produto, a story vem de metaobject da loja — então `ResolvedBlock` e `AreaContent` moram em `domain/contentTypes.ts`, e `domain/contentAreas.ts` tem o `toAreaContent`, que **caminha as declarações, não as resoluções**: cada resolver devolve lista plana e o agrupamento lê área e ordem do config. É isso que deixa uma área intercalar metafield e metaobject exatamente na ordem que o lojista escreveu. `Product.content` virou `Product.blocks` (plano) e o `content` agrupado passou a sair do `useProductGetDetail`.

Consequências menores, todas pela mesma causa: o `id` do bloco declarado é a chave do agrupamento, então ele precisa ser único **dentro da tela** (está documentado no tipo); várias stories compartilham um `id`, então `ContentBlocks` chaveia por `id` + posição; `declaredAreas` deixou de excluir `layout` pelo nome e passou a manter **as chaves que seguram lista de blocos**, então `mainProductRowTitle` (string) e `layout` (objeto) se excluem sozinhos e uma chave nova não precisa editar nada; e `queriedMetafieldBlocks` filtra `source.from === "metafield"`, senão um bloco de metaobject entraria na seleção de metafields do documento.

**Verificado** com `tsc --noEmit` e `eslint` limpos e no simulador já aberto: home com a story no `footer` (estado real) e, por config temporária, no `header`; e a mesma story em `productDetail.belowDescription`, alcançada por rota inicial temporária — as três revertidas ao fim.

---

## 2026-10-07 — As áreas de metaobject viram um grupo `metaobjects`, e o tipo se declara uma vez em `metaobjectSources`

**Decisão:** o que vem dos metaobjects da loja deixa de se espalhar pelas áreas de metafield e passa a morar em `screens.{screen}.metaobjects` — `home.metaobjects.header|footer` e `productDetail.metaobjects.footer`. O tipo e o mapa de campos saem do bloco e viram um registro no nível do lojista: `metaobjectSources: { brandStory: { type, first?, fields } }`, e o bloco aponta com `source: { from: "metaobject", ref: "brandStory" }`.

**`metaobjects` é um grupo de posições, não uma posição.** Dentro dele o caminho da chave continua dizendo onde o bloco cai — o invariante de que nenhum bloco carrega `slot` segue de pé. O que muda é que **as posições das duas árvores nunca repetem nome**: `header`/`footer` só existem no grupo de metaobject. Por isso nenhuma área precisa fundir duas fontes e inventar uma ordem entre elas, e `productDetailAreas()` entrega as duas árvores como uma lista só para o `toAreaContent`. O preço: `aboveDescription`/`belowDescription` deixaram de aceitar `story` — intercalar metafield e metaobject dentro de **uma** área não existe mais, e era o que a versão anterior permitia.

**Por que o registro.** Um tipo usado em duas telas era escrito duas vezes (type + 3 campos + `first`). Com `ref`, "quais metaobjects esta loja usa?" tem um lugar só. O `ref` resolve **dentro da query** (`metaobjectService`), não no render: ref inexistente derruba o bloco, não a tela. E a queryKey ganhou o id do lojista — `ref` só é único dentro de um config, e dois lojistas podem chamar o deles de `brandStory` apontando para lojas diferentes.

**`StoryBlock` não é nome de lojista**, questão levantada no mesmo prompt: `kind` nomeia a forma que o app desenha (`badge`, `textLine`, `labelValueSection`, `story`), nunca a fonte nem o dono. O exclusivo de um lojista é `brand_story`, uma string em `metaobjectSources.{ref}.type`. Fonte e forma são eixos independentes: um metaobject com campos `label`/`value` alimenta um `labelValueSection` sem kind novo.

**Verificado** com `tsc --noEmit` e `eslint` limpos e no simulador já aberto: `home.metaobjects.footer` no estado real, e `productDetail.metaobjects.footer` resolvendo por `ref` por config temporária + rota inicial temporária, ambas revertidas.

---

## 2026-10-07 — As áreas de metafield também viram grupo: a tela agora é `layout` → `metafields` → `metaobjects`

**Decisão:** `badgeRow`, `textLines`, `aboveDescription` e `belowDescription` saem da raiz da tela e passam a morar em `screens.{screen}.metafields`, simétrico ao `metaobjects` que nasceu antes. A tela se lê em três partes: como desenha, o que o **produto** diz, o que a **loja** diz.

Antes a raiz da tela misturava três coisas de natureza diferente — arranjo (`layout`), posições de metafield soltas, e um grupo (`metaobjects`) — e só o leitor sabia qual era qual. Agora toda posição está dentro de um grupo nomeado pela fonte, e a raiz só tem `layout` + os dois grupos.

Consequências: `ProductDetailArea` virou a união das chaves dos dois grupos; `declaredAreas` roda **por grupo** (`metafields`, depois `metaobjects`) e concatena, em vez de filtrar a raiz da tela; `queriedMetafieldBlocks` lê `productDetail.metafields`. Nada mudou na resolução nem no render — o `toAreaContent` continua recebendo uma lista só, porque os nomes não se repetem entre os grupos.

**Verificado** com `tsc --noEmit` e `eslint` limpos. Sem simulador, a pedido do usuário — a mudança é de forma do config, e a resolução por área já estava provada no device.
