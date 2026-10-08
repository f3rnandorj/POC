# Code Style

TypeScript, 2-space indent, **double quotes**, semicolons, trailing commas (`all`), 80-column width. Same config as `bennu/food-balance` — the two repos are kept byte-identical on lint and format so a rule learned in one transfers to the other.

## ESLint is the gate, Prettier is the formatter (MANDATORY)

Two tools, two jobs, no overlap — the `food-balance` split:

```bash
yarn lint          # the gate: logic rules + quote style + import order
yarn lint --fix    # autofixes what ESLint owns
npx prettier --write <glob>   # formatting, one-off; normally the editor does it on save
```

Rules:

1. **Prettier owns whitespace, ESLint owns everything else.** `eslint-plugin-prettier` is *not* installed — ESLint does not reflow code. `.vscode/settings.json` sets `editor.formatOnSave: true` with `esbenp.prettier-vscode` as the formatter, plus `source.fixAll.eslint` for the lint autofixes. One writer per concern is why they no longer fight.
2. **`.prettierrc.js` declares only what diverges from Prettier's defaults** — `arrowParens: 'avoid'`, `singleQuote: false`, `trailingComma: 'all'`. `printWidth` is omitted on purpose: the default 80 *is* the width, and restating a default is noise.
3. **Quote style is an ESLint error, not a Prettier preference** — `quotes: ['error', 'double']` means a single-quoted string fails the gate, so the rule survives even if someone's editor has no Prettier.
4. **Never hand-format to satisfy a reviewer or a hook.** If the formatter and the written style disagree, the formatter wins and the config is what gets discussed.
5. **A formatting diff in a file the task never touched** means the editor and `.prettierrc.js` disagree. Stop and fix the setup.
6. `.eslintignore` keeps the gate fast — native build output, Pods, `vendor/` and `graphify-out/` are not ours to lint. A gate that takes two minutes stops being run. (This file has no counterpart in `food-balance`, which has neither `vendor/` nor a graph artifact.)
7. **Git hooks are the backstop, not the gate.** `.husky/pre-commit` runs `yarn lint`; `.husky/pre-push` runs `tsc --noEmit` then `.claude/scripts/check-security.sh` (needs `gitleaks` + `semgrep` on PATH — a missing scanner fails the push, it never counts as clean). Same two hooks as `food-balance`.

## Imports

Order, separated by a blank line between groups:

1. react / react-native
2. external libs
3. project aliases (`@api`, `@domain`, `@components`, `@theme`, …)
4. relative (same folder only — `./ProductBadgeStyles`, never `../../`)

Always from the module root alias: `import { useProductGetList } from '@domain'`. A deep path (`@domain/Product/useCases/useProductGetList`) is a violation except within the same folder. The service is never importable from `@domain` — see `architecture.md`.

## Blank lines

- Between sibling functions.
- Between import groups.
- Before a non-trivial `return`.
- Around a `useEffect` / `useQuery` block.

No blank line after `{` or before `}`.

## Comments (MANDATORY)

**Default is zero.** Names and types carry intent. A "what" comment is noise, and noise is a
defect — the next reader trusts it, so an outdated or decorative line costs more than the blank
line it replaces.

**Single test:** does the information fit in a name or a type? If yes, it is a rename. If no, and
the context dies with this file, it is a valid comment. Only two cases qualify:

1. **Non-obvious logic** — an external quirk (Shopify, React Native, React Query), a subtle
   invariant, a security decision, a workaround. **One or two lines**, the why, never the what.
2. **Tuning constants** — what a value controls or its unit (`PRESS_DEPTH`, `THUMB`, page sizes,
   measured asset geometry).

A deliberate shortcut uses the `// ponytail:` prefix and names the ceiling + upgrade path.

**Never write, and delete from any file you are already editing:**

- What the code does, or anything restating the identifier below it (`/** The brand colors. */`)
- JSDoc on a prop or type field whose name and type already say it
- Architecture narration — why a layer exists, why a component is the only one of its kind, how
  two modules relate. That lives in `standards/` and `memory/decisions.md`, not in the file
- Pointers to a quick-rule or an ADR by number
- Section-divider banners (`// ==== Entities ==== //`) — including in `{domain}Types.ts`. The
  brain mandates them there; this project does not. See `memory/decisions.md` (2026-10-07)
- Decorative labels (`// header`, `// scrim`), task/ticket references, ownerless `TODO`/`FIXME`
- Stale or lying comments — fix or delete on sight

Scope: files the task already touches. A repo-wide sweep only when the user asks.

## Component / file order (MANDATORY)

Each file declares its **primary export first**, auxiliary declarations last.

- Component file → exported component at top; subcomponents, hooks, helpers, internal constants below.
- Service / api / adapter file → **the exception**: functions first, the singleton `export const {domain}Service = { ... }` LAST, closing the file. The object is an index of the file, not its content.
- Util file → exported function(s) at top; private helpers below.
- `Props`/`Deps` interfaces may stay above the export when they are part of its signature. Everything else goes below.

**Forbidden:** a helper declared before the main export; a subcomponent declared before its parent in the same file; an internal-only constant above the main export; a service/adapter singleton object declared above the functions it groups.

When an auxiliary component passes ~30 lines or gets reused, extract it to a sibling file.

## No inline utilities in pure layers (MANDATORY)

| Layer | May declare inline | MUST be extracted |
|---|---|---|
| `{domain}Service.ts` | orchestration, config constants | any pure transform, parser, predicate |
| `{domain}Adapter.ts` | the mapping functions themselves | nothing — the adapter *is* the utils layer for its domain |
| `useCases/*.ts` | query key composition | formatters, math, grouping |
| `components/*.tsx` | sub-components <30 lines used only here, callbacks bound to local state | pure formatters (`formatPrice`), data shaping, predicates, label maps |
| `screens/*.tsx` | top-level orchestration + handlers wired to local state | anything pure → the screen's local `utils/` |

Where to extract:
- domain helper → `src/domain/{Domain}/utils/{name}.ts`
- screen-scoped helper → `src/screens/{Screen}/utils/{name}.ts`
- cross-cutting → `src/utils/{name}Utils.ts`

Single-export file stays a plain `export function name(...)`. Multi-export file groups into a `{filename}` const.

## Component size soft-limit (~150 lines)

`.tsx` > 150 lines is a smell, > 250 a defect. Break it via: sub-components in sibling files (subfolder when 3+) → pure helpers to local `utils/` → state lifted into `use{ComponentName}State`. The limit is soft; an unavoidable case is justified in a comment at the top of the file.

## No nested function declarations

`function inner(...)` inside another `function outer(...)` is forbidden, except:

- a genuine closure over local variables that cannot be parameters;
- an event handler bound to component-local state inside a React component.

Everything else → top-level in the same file (below the main export) or extracted to `utils/`.

## Types

- Domain types are domain-prefixed to avoid collisions: `Product`, `ProductVariant`, `ProductContent`; raw Storefront types carry the `Api` suffix: `ProductApi`, `MetafieldApi`.
- Optional means optional: `badge?: string`, never `badge: string | null`. The adapter normalizes `null` → `undefined` so the UI has exactly one absent-value check.
- No `any`. An unknown Storefront shape is typed `unknown` and narrowed in the adapter.
