# PRD: Product Metafields (badge, material, promotion)

**Status:** draft
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
- [ ] `components/ProductBadge/ProductBadge.tsx` takes a single prop: `text?: string`
- [ ] **Returns `null` on falsy text** — no skeleton, no placeholder, no reserved space
- [ ] `accent` fill, `accentText` label, `badge` text variant, `s2` radius, `alignSelf="flex-start"`
- [ ] No emoji — the README's star is prose describing a badge, not a spec
- [ ] The component's name and props contain no merchant reference

### US-002: ProductMetadata

As a merchant, I want my material and promotion copy shown so that the product page carries my details.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `components/ProductMetadata/ProductMetadata.tsx` takes `material?` and `promotion?`
- [ ] Each line renders only when its value is present
- [ ] All values absent → the component returns `null`, contributing no spacing
- [ ] `textMuted` token, `body` variant
- [ ] No label prefix that would read as `Material: undefined` in any state

### US-003: Wire the metafields into the detail screen

As a user, I want the custom information in the product page so that the merchant's content reaches me.

**Depends on:** US-001, US-002
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] The badge and metadata slots from PRD 003 are filled with the two components
- [ ] Values come from `product.metafields`, already parsed by the adapter
- [ ] The screen contains no `if (x !== undefined)` guard around them — the components own that
- [ ] Order: title → price → badge → metadata → description
- [ ] Northstar Essential shows `BEST SELLER`, `Organic Cotton`, `Free shipping above $199`
- [ ] Everyday Tee shows none, and the description sits where the metadata would have been with no gap

### US-004: Absent-value sweep

As a reviewer, I want the absent case proven so that the POC's grading criterion is met on every path.

**Depends on:** US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] The list screen and the detail screen are both checked against the Everyday Tee
- [ ] No `undefined`, `null`, `NaN`, `—` or empty quotes render anywhere
- [ ] Temporarily clearing a single metafield in the Shopify admin removes exactly that line and nothing else

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

## Open Questions

- **Two badges on one product** — PRD 005 introduces a second badge. **Assumption:** they stack horizontally with `s8` gap, both using the filled treatment. Revisit in PRD 005 if the pair reads as noise.
