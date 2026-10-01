# ADR Index (hot — always loaded)

> One line per ADR. Full text + rationale in `decisions.md` (loads only on `adr|decisão|por que decid|override|invariant` prompts). Older entries in `decisions-archive.md`.
>
> On every append: sort each row by which fires first — (1) already promoted into `standards/*`/`CLAUDE.md` → archive now; (2) one-off decision, no cross-cutting reuse → archive after ~21 days; (3) cross-cutting pattern with no `standards/` home → keep up to ~60 days, but promote it into `standards/` before that window closes.

| Date | Decision |
|---|---|
| 2026-09-30 | `.claude/` is the single source of truth; brain is fallback only |
| 2026-09-30 | Profile mobile (RN CLI) · dev mode ai-assisted · team solo — declared, never re-detected |
| 2026-09-30 | Shopify **Storefront API** + GraphQL, version-pinned; Admin API never reaches the device |
| 2026-09-30 | **API-Bound** infra (service → api → adapter), no repository interfaces — one transport |
| 2026-09-30 | Metafields queried by explicit identifier; adapter owns parsing; absent → `undefined` → component returns `null` |
| 2026-09-30 | Merchant variation = credentials + feature flags + theme tokens; merchant names confined to `config/merchant/` |
| 2026-09-30 | No test layer; verification is the simulator, and no coverage gate is installed |
| 2026-09-30 | Design identity: streetwear / neutral + one accent / geometric sans / compact density |
| 2026-09-30 | Knowledge graph installed below the size threshold, by user request — self-healing rule + queue hook |
| 2026-10-01 | RN CLI conventions: hooks `use{Domain}{Action}{Target}`, singleton objects export last, no per-component/per-screen barrel, domain barrel never exports the service |
| 2026-10-01 | PRD 001 executed: jest not merged (no test layer), `theme/colors.ts` split for token typing, every text variant carries a color token, `react-native-config` wired (consumed in 008), Android left on the default scaffold |
| 2026-10-01 | Inter linked as a real font asset; weight selected by face (`fontFamily`), never `fontWeight` |
| 2026-10-01 | Graph scoped by `.graphifyignore` — `ios/Pods` was burying the app's own nodes; `graphify-out/cache/` gitignored |
| 2026-10-01 | Design validation no longer requires a small+large device matrix — one simulator is enough |
| 2026-10-01 | Git writes (`init`/`add`/`commit`/`push`/PR) need an explicit user request — a PRD acceptance criterion is not one; not hook-enforced, carried by the model |
| 2026-10-01 | PRD 002: `fetch` nativo (sem axios), fragments `Core`/`Card` separados por conflito de argumento em `images`, identificadores de metafield em `merchantConfig`, adapter indexa por `key` |
