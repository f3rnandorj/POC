# PRD: Product Metafields (badge, material, promotion)

**Status:** done
**Shipped:** 2026-10-01
**Started:** 2026-10-01
**Source:** README — CASE 2 "Metafields" + Requisito 2

## Overview

Surface the merchant's custom product information on the Product Detail through generic, merchant-agnostic components. This block closes the EMV: the Northstar Essential shows its badge, material and promotion text; the Everyday Tee shows none of them and leaves no gap behind.

## Goals

- Three metafields render on the product that has them
- The product without them renders as if the feature did not exist
- Not one component or file carries the merchant's name

## Standards Referenced

- `.claude/standards/shopify.md` — the metafield contract, generic components
- `.claude/standards/design.md` — `ProductBadge` as the identity primitive
- `.claude/templates/metafield-feature.md` — the reusability path
- `.claude/standards/naming.md` — merchant names confined to `config/merchant/`

## Decisions Referenced

- 2026-09-30 — Metafields queried by explicit identifier; adapter owns parsing; absent → `undefined` → component returns `null`
- 2026-09-30 — Merchant variation = credentials + feature flags + theme tokens

## Quality Gates

- Northstar Essential renders badge, material and promotion
- Everyday Tee renders none of the three, with no placeholder, no empty row, no leftover spacing
- `grep -ri northstar src/ --exclude-dir=config` returns nothing

## User Stories

### US-001: ProductBadge

As a merchant, I want a highlight on my product so that shoppers notice it — and as a platform, I want one badge component for every merchant.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `components/ProductBadge/ProductBadge.tsx` takes a single prop: `text?: string`
- [x] **Returns `null` on falsy text** — no skeleton, no placeholder, no reserved space
- [x] `accent` fill, `accentText` label, `badge` text variant, `s2` radius, `alignSelf="flex-start"`
- [x] No emoji — the README's star is prose describing a badge, not a spec
- [x] The component's name and props contain no merchant reference

### US-002: ProductMetadata

As a merchant, I want my material and promotion copy shown so that the product page carries my details.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `components/ProductMetadata/ProductMetadata.tsx` takes `material?` and `promotion?`
- [x] Each line renders only when its value is present
- [x] All values absent → the component returns `null`, contributing no spacing
- [x] `textMuted` token, `body` variant
- [x] No label prefix that would read as `Material: undefined` in any state

### US-003: Wire the metafields into the detail screen

As a user, I want the custom information in the product page so that the merchant's content reaches me.

**Depends on:** US-001, US-002
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] The badge and metadata slots from PRD 003 are filled with the two components
- [x] Values come from `product.metafields`, already parsed by the adapter
- [x] The screen contains no `if (x !== undefined)` guard around them — the components own that
- [x] Order: title → price → badge → metadata → description
- [x] Northstar Essential shows `BEST SELLER`, `Organic Cotton`, `Free shipping above $199`
- [x] Everyday Tee shows none, and the description sits where the metadata would have been with no gap

### US-004: Absent-value sweep

As a reviewer, I want the absent case proven so that the POC's grading criterion is met on every path.

**Depends on:** US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] The list screen and the detail screen are both checked against the Everyday Tee
- [x] No `undefined`, `null`, `NaN`, `—` or empty quotes render anywhere
- [x] Temporarily clearing a single metafield in the Shopify admin removes exactly that line and nothing else

## Functional Requirements

- FR-1: `badge`, `material` and `promotion_text` render when present
- FR-2: An absent metafield renders nothing at all
- FR-3: Components are named for the capability, never the merchant
- FR-4: The presence check lives in the component, not at the call site

## Non-Goals

No winter collection (PRD 005), no care instructions (PRD 006), no metafield editing, no admin UI, no per-merchant key mapping yet (PRD 008).

## Technical Considerations

- The parsing already happened in PRD 002's adapter. This block must not re-parse, re-check or re-shape anything — if it needs to, the adapter is wrong and gets fixed there.
- `ProductBadge` returning `null` on falsy text is what makes every later "hide the section when empty" requirement a one-liner. It is the single most reused behavior in the POC.
- A second badge variant (outline) is allowed only when two badges must coexist, and it is declared in the theme, never at the call site.

## Success Metrics

- Adding a fourth text metafield would touch the query, the adapter and one render line — nothing else
- Side-by-side screenshots of both products show the difference with no visual artifact

## Resolved Decisions

- The absent case was validated **against the live Shopify admin by the user**, not simulated in code. Three real mutations, all passing:
  - `material` had its **Storefront access revoked** on the definition → Storefront returns `null` → the line disappears, the badge sits straight against the promotion, no gap and no crash. This is the failure mode that bites in production (shopify.md, metafield rule 5), and the app treats it as plain absence.
  - `promotion_text` set to **143 characters** → wraps to four lines, clips nothing, and the CTA stays pinned and visible because the footer lives outside the `ScrollView`.
  - `material` set to **whitespace only** → `readText`'s trim maps it to `undefined`, so nothing renders.
  - The leading space the admin kept on the long promo value confirms the trim on the render path too — the line starts flush with the badge.
- That run also closed the partial case end to end (badge present + `material` absent + promotion present, all from real API data), which an earlier in-code override had only proven at the component level.
- `ProductMetadata` renders its lines with `{value ? <Text/> : null}` rather than `{value && <Text/>}`. The adapter already maps `''` to `undefined`, but `&&` leaks an empty string into the tree, and a bare string outside `<Text>` is a React Native crash — the ternary cannot.
- No label prefix on the metadata lines. A `Material:` prefix is exactly the construct that produces `Material: undefined` the moment the metafield goes away, and the merchant's values already read as sentences.
- The badge was **not** added to `ProductCard`. PRD 004 scopes it to the detail screen; the grid stays title + price.

## Open Questions

- **Two badges on one product** — PRD 005 introduces a second badge. **Assumption:** they stack horizontally with `s8` gap, both using the filled treatment. Revisit in PRD 005 if the pair reads as noise.
