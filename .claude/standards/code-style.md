# Code Style

TypeScript, 2-space indent, single quotes, semicolons, trailing commas (Prettier defaults — no config restating them).

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

## Comments

Explain **why**, never what. No section-divider comment banners. A comment marking a deliberate shortcut uses the `// ponytail:` prefix and names the ceiling + upgrade path.

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

- Domain types are domain-prefixed to avoid collisions: `Product`, `ProductVariant`, `ProductMetafields`; raw Storefront types carry the `Api` suffix: `ProductApi`, `MetafieldApi`.
- Optional means optional: `badge?: string`, never `badge: string | null`. The adapter normalizes `null` → `undefined` so the UI has exactly one absent-value check.
- No `any`. An unknown Storefront shape is typed `unknown` and narrowed in the adapter.
