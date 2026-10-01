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

> When a new decision is made, append below with a date heading and add its row to `decisions-index.md` in the same edit.
