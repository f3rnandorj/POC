# Quick Rules — Non-Negotiables

> Always loaded. Full detail in `standards/{architecture,shopify,frontend,design,code-style,security,naming}.md`. Enforced mechanically by `hooks/pre-edit-validate.sh` where possible.

## Stack

1. **Stack pin** — React Native CLI + TypeScript, React Navigation, TanStack Query v5, `@shopify/restyle`, axios (or `graphql-request`) for the Storefront call, yarn. No Expo APIs, no `StyleSheet.create`, no Redux.
2. **Shopify only through the adapter** — screens and components never see a Storefront response. `shopifyApi` → `{domain}Adapter` → domain model → useCase hook → UI. See `shopify.md`.
3. **GraphQL lives in `{domain}Queries.ts`** — no inline query strings in services, hooks or screens.
4. **Storefront token comes from config, never hardcoded** — `src/config/merchant/` holds it; no token literal in a tracked file. See `security.md`. Merchant variation is exactly three things and lives in the same place: credentials, `theme.primaryColor`, and a `screens` map. No feature flags, no concept union, no label map — see `shopify.md`, "Multi-merchant strategy".

## Metafields & merchant customization

5. **Absent metafield renders nothing** — no `undefined`, no `null`, no "Material: —". A block whose source is absent produces no resolved block, an area that collected nothing is omitted from `content`, and every component returns `null` on a missing value. Non-negotiable.
6. **No merchant-named and no concept-named code** — `<ProductBadge text={...} />`, never `<NorthstarWinterBadge />`, and no `winterCollection` / `careInstructions` identifier outside `config/merchant/`. Merchant identity *and* vocabulary live in the merchant's config file. See `shopify.md`.
7. **New metafield = one config entry** — a block appended to the array at `screens.{screen}.{area}`, and nothing else. The key path says where it lands and the array index says when, so no block carries a `slot` or an `order`. The word for a position is **area**, never *section*: `labelValueSection` is a block kind you put *in* an area. Touching a type, the adapter, a query or a screen means the *kind* is missing, and a new kind is a platform change, not a merchant one. Follow `templates/metafield-feature.md`.

## UI

8. **Restyle props over `style={{}}`** — `backgroundColor="primary"`, `padding="s16"`. `style` only for computed values (`hexToRgba`) or non-theme numbers.
9. **Tokens only, no raw hex** — every color/spacing/radius comes from `src/theme`. A new token is an ADR, not an inline value. See `design.md`.
10. **Barrel imports** — always `@{module}` at the root, never a deep path. `index.ts` in every *module* folder; **not** inside a single-file component folder nor inside a screen folder. The domain barrel exports **useCases + types only — never the service**.

## Cross-cutting

11. **No test layer installed** — this repo has no Jest/RTL setup. A task that asks for tests starts by saying the infra must be installed first; never emit a `*.test.ts` against absent infra. Verification here is the simulator (`yarn ios` / `yarn android`), not a green suite — **always the one simulator already running**. Never boot a second device, install the build on another model, or run a small/large matrix, whatever a PRD gate names: width risk is proven by forcing long content on the device at hand. See `design.md`.
12. **Issue → repro before code** — normalize the report, reproduce it, then fix at the shared point all callers route through (grep the callers first). Patching only the reported path is not a fix.
13. **File order — main export first, singleton objects last** — components/hooks: primary export at the top, subcomponents and helpers below. `{domain}Service/Api/Adapter`: functions first, `export const {domain}Service = {...}` closing the file. See `code-style.md`.
14. **Pure layers stay pure — no inline helpers** — services, useCases, components never declare pure utilities inline (formatters, parsers, predicates, label maps). Extract to the nearest `utils/`. Allowed inline: `Props`/`Deps` interfaces, callbacks bound to local state, sub-components <30 lines used only here.
15. **Component size soft-limit ~150 lines** — `.tsx` > 150 is a smell, > 250 a defect. Break via sibling sub-components, extract helpers to `utils/`, lift state into `use{Name}State`.
16. **No nested function declarations** — `function inner(){}` inside `function outer(){}` is forbidden except a genuine closure over local vars, or a React handler bound to component state.
17. **No-V2 by default** — nothing is deferred to "later" / "phase 2" on the AI's initiative. Doubts, gaps and edge cases are asked and resolved in the first pass. V2 exists only when the user says so. Only legitimate exclusion: the README's explicit "O que NÃO fazer" list.
18. **Destructive commands need explicit user approval** — `rm -rf` outside `/tmp|node_modules|ios/Pods|.gradle|DerivedData|metro-cache|build`, `git reset --hard` / `clean -f` / force-push / `branch -D`, simulator erase / `adb pm clear`. Enforced by `hooks/bash-guard.sh`, which routes the command to the user's permission prompt (`permissionDecision: "ask"`) — an explicit approval lets it run. Never work around the guard; rephrase instead when it fires on a false positive.
19. **Graph first** — architecture/impact/exploration questions start at `graphify-out/`, not at Grep. Graph missing or stale → rebuild (`graphify .` / `graphify update .`) then proceed.
20. **Git write operations need an explicit request from the user** — `git init`, `add`, `commit`, `branch`, `tag`, `push`, PR creation. The AI delivers **one uncommitted batch** and reports what changed; staging and history are the user's step. A PRD acceptance criterion that says "commit" is **not** the user's request — it describes the block's definition of done, and the user still has to ask. Approval for one commit never extends to the next. Not hook-enforced: a guard cannot tell an authorized commit from an unrequested one, so this rule is on the model.

21. **ESLint gates, Prettier formats — and the config is `food-balance`'s, verbatim** — double quotes (`quotes: ['error','double']`), `trailingComma: 'all'`, `arrowParens: 'avoid'`, width 80. `yarn lint` must pass. `eslint-plugin-prettier` is **not** installed: ESLint never reflows code, Prettier does, on save via `esbenp.prettier-vscode`. `.husky/pre-commit` runs the lint, `.husky/pre-push` runs `tsc --noEmit` + `check-security.sh`. A formatting diff in a file the task never touched means the editor disagrees with `.prettierrc.js` — fix the setup, don't commit it. See `code-style.md`.

## Brain fallback

- **`.claude/` always wins** over `~/.claude/brain/`. Brain is a reference library, not auto-loaded.
- **Read brain only when:** (a) the user explicitly invokes it; (b) `.claude/` is silent — declare "Topic not covered in .claude/. Falling back to brain." before reading; (c) two local files disagree (brain breaks the tie, then fix the local conflict).
- **After fallback:** apply the rule, then propose adding it to `.claude/standards/*` — never a silent write.
- Precedence: `prds/active/<feature>` > `standards/*` > `memory/decisions.md` > brain developer > brain personal. Full rules in `../precedence.md`.

## See also

- Active ADRs: `../memory/decisions-index.md` (full text in `decisions.md`)
- Routing manifest: `_index.md` (not auto-loaded — `route-prompt.sh` handles routing)
