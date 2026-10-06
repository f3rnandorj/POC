# ADR Archive

Cold storage for ADRs no longer actively referenced. Loads only on `archive|histórico|legacy` prompts.

When an ADR moves here from `decisions.md`, its row in `decisions-index.md` moves or is dropped **in the same edit** — an index row pointing at `decisions.md` for text that lives here is a doctor finding.

---

## Index rows archived 2026-10-06 (decided up to 2026-10-02)

Full text stays in `decisions.md`, which is append-only — only the index row moved, because
`decisions-index.md` is always loaded and these are settled: each one is either already promoted
into `standards/*`/`CLAUDE.md` or a one-off with no cross-cutting reuse left.

| Date | Decision |
|---|---|
| 2026-09-30 | `.claude/` is the single source of truth; brain is fallback only |
| 2026-09-30 | Profile mobile (RN CLI) · dev mode ai-assisted · team solo — declared, never re-detected |
| 2026-09-30 | Shopify **Storefront API** + GraphQL, version-pinned; Admin API never reaches the device |
| 2026-09-30 | **API-Bound** infra (service → api → adapter), no repository interfaces — one transport |
| 2026-09-30 | Metafields queried by explicit identifier; adapter owns parsing; absent → `undefined` → component returns `null` |
| 2026-09-30 | Merchant names confined to `config/merchant/` |
| 2026-09-30 | No test layer; verification is the simulator, and no coverage gate is installed |
| 2026-09-30 | Design identity: streetwear / geometric sans / compact density — a **base** a merchant tints, not a constant |
| 2026-09-30 | Knowledge graph installed below the size threshold, by user request — self-healing rule + queue hook |
| 2026-10-01 | RN CLI conventions: hooks `use{Domain}{Action}{Target}`, singleton objects export last, no per-component/per-screen barrel, domain barrel never exports the service |
| 2026-10-01 | PRD 001 executed: jest not merged (no test layer), `theme/colors.ts` split for token typing, every text variant carries a color token, `react-native-config` wired (consumed in 008), Android left on the default scaffold |
| 2026-10-01 | Inter linked as a real font asset; weight selected by face (`fontFamily`), never `fontWeight` |
| 2026-10-01 | Graph scoped by `.graphifyignore` — `ios/Pods` was burying the app's own nodes; `graphify-out/cache/` gitignored |
| 2026-10-01 | Design validation no longer requires a small+large device matrix — one simulator is enough |
| 2026-10-01 | Git writes (`init`/`add`/`commit`/`push`/PR) need an explicit user request — a PRD acceptance criterion is not one; not hook-enforced, carried by the model |
| 2026-10-01 | PRD 002: `fetch` nativo (sem axios), fragments `Core`/`Card` separados por conflito de argumento em `images`, identificadores de metafield em `merchantConfig`, adapter indexa por `key` |
| 2026-10-01 | PRD 003: back control (swipe não pode ser a única saída), picker some em variante única, preço formatado em `utils/`; deep links entraram e saíram — nunca adicionar recurso só para testar |
| 2026-10-01 | Simulador se dirige por render temporário, nunca por evento sintético de mouse — rouba o cursor real do usuário |
| 2026-10-01 | PRD 004: absent-case validado no admin real (storefront access revogado, valor só espaço, texto de 143 chars); `ProductMetadata` usa ternário em vez de `&&` (string vazia fora de `<Text>` quebra o RN); sem prefixo de label; badge não entrou no card da grid |
| 2026-10-01 | CTA fixo sobre `ScrollView`: o conteúdo reserva espaço medindo o rodapé por `onLayout`, nunca por constante — safe area, escala de fonte e label do botão mudam a altura |
| 2026-10-01 | PRD 005: label do badge vem de `merchantConfig.labels` (não hardcoded na tela); linha de badges é condicional só por layout — flex row vazia consome o `gap` da coluna; dois badges accent lado a lado aprovados, sem variante outline |
| 2026-10-01 | **Um simulador, nunca matriz de devices** — não subir segundo simulador nem instalar o build em outro modelo, mesmo com PRD nomeando largura; largura se prova forçando conteúdo longo no device em mãos (quick-rule #11, `design.md`, brain `rn-cli/tooling/simulator.md`) |
| 2026-10-01 | PRD 006: `ProductSection` genérico (`title` + `{label,value}[]`, `null` quando nada sobra); `readJson` com try/catch no adapter — JSON de merchant é entrada não confiável; flag resolve junto do dado, tela não envolve componente em condicional |
| 2026-10-01 | React Query v5 recusa `undefined` como dado — "not found" atravessa o cache como `null` e o hook devolve `undefined` à UI; valia para detalhe de produto desde a PRD 002 |
| 2026-10-01 | PRD 007: `collectionAdapter` importa `productAdapter` por caminho relativo (exceção comentada à regra de barrel); lista serve os dois escopos com um par de hooks, cada um desabilitado no modo do outro; `BackControl` virou genérico com `top` opcional |
| 2026-10-01 | PRD 008: `accentText` é derivado da luminância do accent, não um segundo override; hex de marca mora no config do merchant, não em `palette.ts` |
| 2026-10-01 | PRD 011 (bônus): metaobject `brand_story` com o tipo vindo de `merchantConfig.metaobjects`; imagem de metaobject vem de `reference`, nunca de `value` (que é gid); `StoryCard` genérico; `contentOffset` não funciona em `FlatList` com dado assíncrono — lista vazia no primeiro layout zera o offset |
| 2026-10-01 | PRD 009: seed por `productSet` com `identifier` (sem ele não é upsert); disponibilidade por rastreamento de inventário, não quantidade; token Admin em `~/.config`, nunca no scratchpad nem no `.env` |
| 2026-10-01 | **Foto de seed se escolhe pelo que está no quadro** — marca de terceiro, pessoa, fundo — antes de checar se o link responde. Não existe acervo grátis de peça isolada em fundo preto: catálogo padronizou no claro |
| 2026-10-01 | Deleção de dado de loja é do usuário: a etapa foi escrita, recusada pelo harness, e feita no admin. Script de seed semeia e restiliza, nunca apaga |
| 2026-10-02 | ~~ESLint é o único gate e o único formatador (Prettier como regra)~~ — **revertida em 2026-10-03**, ver última linha |
| 2026-10-02 | PRD 010: README do projeto substitui o briefing (texto antigo descartado, vive no histórico); screenshots em `docs/screenshots/` a 420px, capturadas por rota temporária e nunca por input sintético; defeito achado no run-through se conserta onde mora, não no README |
| 2026-10-02 | Clone limpo é gate de README, não formalidade: achou peer dep do `eslint-plugin-prettier` (v5 exige prettier>=3, repo no 2.8.8) e `pod install` sem `bundle install` — dois defeitos invisíveis na cópia de trabalho |
| 2026-10-02 | PRD 012: variação de lojista é **uma lista de content blocks** — `kind` e `slot` pareados em união discriminada, `source`, `order` e labels vindos do config; conceito novo é uma entrada de array e nada mais. Feature flags, união de conceitos e mapa de labels deletados; adapter indexa por `namespace:key`; JSON de metafield validado como objeto antes de virar seção |
| 2026-10-02 | iOS 26+ mata app sem UIScene no launch: `SceneDelegate` dentro de `AppDelegate.swift` (evita editar `project.pbxproj`), window criada pela scene e não pelo app. Metro morto e crash nativo pré-bundle parecem iguais — o log do Metro distingue |

## Index rows archived 2026-10-06 (decided on 2026-10-03)

Same reason, second pass: every one of these is promoted into `standards/*` — lint into
`code-style.md`, the dependency gate into `security.md`, the palette into `design.md`, the `Screen`
container and the motion rules into `frontend.md`/`design.md`, the screens-and-areas map into
`shopify.md`. The layout row is also **superseded**: arrangements moved inside each screen on
2026-10-06.

| Date | Decision |
|---|---|
| 2026-10-03 | **Lint/format do POC é cópia byte a byte do `bennu/food-balance`** — aspas duplas via regra ESLint, `trailingComma: 'all'`, width 80, `plugin:@tanstack/query/recommended`, `no-inline-styles` off; `eslint-plugin-prettier` removido (ESLint não reflui código, Prettier formata no save); husky `pre-commit` → lint, `pre-push` → `tsc --noEmit` + `check-security.sh`. Reverte a ADR de 2026-10-02: divergir de propósito custou mais que o reflow que ela evitava |
| 2026-10-03 | **Gate de dependência bloqueia o corrigível, reporta o resto** — `audit-gate.js` separa high/critical por `patched_versions`: com patch disponível falha o push, `<0.0.0` (sem patch upstream) sai como aviso. Travar o push num advisory que ninguém pode consertar é o que faz adotar `--no-verify` e aí o gate inteiro deixa de existir. Auto-cicatriza: patch publicado volta a bloquear. Caso: `braces` #1240992 via `metro`, sem patch |
| 2026-10-03 | PRD 013: paleta de marca por lojista — `background`/`surface`/`text`/`textMuted`/`border` + accent viram override; `accentText` e agora `success`/`danger` são **derivados** (mint lê 1.68:1 no claro); tema estoura em `__DEV__` abaixo de 4.5:1 de cópia ou 3:1 de estado |
| 2026-10-03 | PRD 014: layout por lojista — `featured` single|double, `collections` inline|horizontal, `detail` single|gallery, união fechada com default. Variante de componente é prop nomeada (`CollectionCard` row|tile), nunca objeto de layout no config. Galeria só rende onde o catálogo tem foto — Northstar tem 6 e 4 por produto, Atlas tem 1 e lá degrada para imagem única |
| 2026-10-03 | `Screen` vira o container de toda tela (safe area, background, gutter, back, título) — modelado no `food-balance`, sem teclado/header animado/estados. Gutter nunca no *frame* de um scroller (iOS recorta no frame e o furo morre ali) — `screenGutter` vai no `contentContainerStyle` da lista, e a linha horizontal fura com `marginHorizontal="sNegative16"`. `gutter={false}` só para tela de foto sangrada |
| 2026-10-03 | **Reanimated 4 + worklets 0.13** (worklets é peer separado no RN 0.87; `react-native-worklets/plugin` por último no babel). Feedback de toque mora no `PressableBox` — todo tocável já roteia por lá; `theme/motion.ts` torna duração/curva token; `AnimatedBox` mantém view animada falando restyle. Metro lê `babel.config.js` só na subida: dev server antigo serve bundle sem worklet e dá tela vermelha de `bytecode` que parece nativa — `--reset-cache` |
| 2026-10-03 | Lottie no loading do detalhe: `lottie-react-native` 7.5.0, fill repintado em JS com o accent do lojista (`theme/lottieTint.ts`) em vez de `colorFilters` nativo — keypath depende do nome que o designer exportou. `@assets` vira alias. Recorte da arte medido do JSON (`cover`), não chutado; bloco de loading centralizado, ramo de erro segue no gutter. Build iOS exigiu `post_install` subindo todo pod abaixo de `min_ios_version_supported` — o bundle de privacy do `lottie-ios` declara 13.0 |
| 2026-10-03 | Warning de `exports` do `ReactNativeFeatureFlags` é bug da própria RN 0.87.1 (`@react-native/virtualized-lists` importa subpath que o `exports` do `react-native` não declara; segue assim no 0.88.0-rc.3). `resolveRequest` no `metro.config.js` resolve só esse especificador direto para o arquivo — bundle sai com md5 idêntico. Remover quando `exports` cobrir `./src/private/*` |
| 2026-10-03 | **Variação de lojista é um mapa de telas e áreas** — `screens: { productDetail: { badgeRow: [...] }, home: { footer: {...} } }`: o caminho de chaves é a posição (bloco sem `slot`), o índice é a ordem (bloco sem `order`), o tipo do elemento é o que a área aceita (substitui a união `kind`×`slot`), `home.footer` é bloco único. **Área, nunca seção** — `labelValueSection`/`ProductSection` já são seção; e aninhar por tela tira o prefixo `detail` de cada chave. Área opcional = chave ausente, e é o mecanismo inteiro. Ordem *entre* áreas segue sendo da tela |
| 2026-10-03 | **Animação de entrada mora no wrapper, feedback de toque no tocável** — `entering`/`layout` e o press scale escrevem `transform` na mesma view e o Reanimated avisa que um sobrescreve o outro; o `PressableBox` embrulha sozinho num `AnimatedBox` (ponto único por onde todo tocável passa), callers intactos. Warning de JS não aparece no log nativo — hook temporário de `console.warn` → sink HTTP local foi o que leu a mensagem; toast de LogBox em screenshot é defeito, não cosmético |
| 2026-10-03 | **Troca de loja em runtime é afordância de demo, e paga o preço no lado dela** — `activeMerchant.ts` guarda o id mutável + `useSyncExternalStore`; nada derivado do lojista pode ser constante de módulo (`merchantConfig()`, `merchantLayout()`, `productDetailAreas()`, `homeFooterStory()`, `buildTheme()` viraram funções), e o root remonta por `key={merchantId}`. Exceção: o documento GraphQL é template literal montado uma vez, então os identificadores de metafield passam a ser os de **todos** os lojistas declarados — adapter indexa por identificador e resolve só os do ativo, identificador não declarado volta null. Cache limpo na troca (queryKey não carrega lojista) e credenciais validadas antes de trocar, senão o APK morre na tela |
| 2026-10-03 | **Flash branco entre telas no Android é a janela, e quem tapa é o root do app** — `react-native-screens` entrega os primeiros frames da tela entrando antes do React pintar, e a cadeia de ancestrais em JS era toda transparente, deixando aparecer o `windowBackground` do `Theme.AppCompat.DayNight` (branco em aparelho no modo claro). `contentStyle` e o tema do `NavigationContainer` pintam a tela, não o que está atrás dela. Cor fixa em `styles.xml` não serve: background é do lojista e muda em runtime — o `Box backgroundColor="background"` no `Router` é o único ponto que conhece o tema ativo e está atrás da pilha. Isolado por `screenrecord` + `cmd uimode night yes` (sem rebuild): a faixa muda de branca para cinza-escura, o que prova ser a janela. Cold start continua branco por um frame |
| 2026-10-03 | **Linha de produtos da Home não é "featured"** — `layout.featured` → `layout.productRow` (arranjo) e `screens.home.productRow` (título, string pura: o conteúdo é o catálogo, só o nome é do lojista). Northstar titula `Products`, atlas roda sem cabeçalho; link à direita virou `See all`. Nada novo vem da loja — curadoria real (collection handle ou `compareAtPrice`) segue no `ponytail:` como upgrade |
