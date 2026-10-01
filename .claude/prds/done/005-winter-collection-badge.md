# PRD: Winter Collection Badge

**Status:** done
**Shipped:** 2026-10-01
**Started:** 2026-10-01
**Source:** merchant request — "a special badge for Winter Collection products"

## Overview

The first unplanned merchant request. A boolean metafield marks which products belong to the Winter Collection, and those products show a second badge. The block exists to prove a claim, not to add a feature: an incoming requirement should cost a config entry, an adapter line and a render line — and must not produce a component named after the merchant.

## Goals

- Marked products show the badge; unmarked ones show nothing
- The feature is reachable through a merchant feature flag
- No file, component, type or token mentions Northstar

## Standards Referenced

- `.claude/standards/shopify.md` — generic components, feature flags, multi-merchant strategy
- `.claude/templates/metafield-feature.md` — the exact path this block follows
- `.claude/standards/naming.md` — merchant names confined to `config/merchant/`

## Decisions Referenced

- 2026-09-30 — Merchant variation = credentials + feature flags + theme tokens
- 2026-09-30 — Metafields queried by explicit identifier; adapter owns parsing

## Quality Gates

- The diff touches no screen file beyond a single render line, and no navigation file at all
- Flipping `features.winterCollection` to `false` hides the badge without any other change
- `grep -ri "winter" src/components/` returns nothing

## User Stories

### US-001: Boolean metafield through the layers

As a merchant, I want to flag a product as Winter Collection in Shopify so that the app reflects it without a release.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `custom.is_winter_collection` is already in the query from PRD 002 — confirmed, not re-added
- [x] The adapter maps it to `isWinterCollection?: boolean` via `value === 'true'`
- [x] A product that does not define it yields `undefined`, not `false`
- [x] Northstar Essential arrives `true`; Everyday Tee arrives `undefined`

### US-002: Feature flag

As a platform, I want the capability gated per merchant so that enabling it for a second merchant is a config edit.

**Depends on:** US-001
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `merchantConfig.features.winterCollection: boolean` exists and is typed
- [x] The badge renders only when the flag is on **and** the product value is true
- [x] The label text lives in config, not hardcoded in the screen
- [x] Flag off → nothing renders, and no empty space remains

### US-003: Render through the existing badge

As a user, I want the Winter Collection marker on the product page so that I recognize the collection.

**Depends on:** US-002
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] The existing `ProductBadge` is reused — **no new badge component is created**
- [x] The badge slot resolves its text in one expression and passes it down; `ProductBadge` still owns the null case
- [x] Two badges on one product lay out side by side with `s8` gap, wrapping rather than overflowing at 375pt
- [x] `<NorthstarWinterBadge />` does not exist in any form

## Functional Requirements

- FR-1: The flag comes from Shopify, controlled by the merchant
- FR-2: The badge renders only for flagged products of a merchant with the feature enabled
- FR-3: The implementation adds no merchant-specific component

## Non-Goals

No collection pages, no filtering by collection, no seasonal theming, no second badge style, no badge priority rules beyond side-by-side.

## Technical Considerations

- `value` is the string `"true"`, not a boolean. This is the same trap as PRD 002 and the adapter already handles it — this block must not re-handle it locally.
- A product that never defined the metafield must yield `undefined`, not `false`. The distinction matters for a future merchant who uses the key to mean something else.
- Two filled badges can read as noise. If they do at review, the second one takes the theme's outline treatment — declared in the theme, never at the call site.

## Success Metrics

- Total diff under ~20 lines across config, adapter and one screen line
- Anyone reading the code answers "what changes for the next merchant?" with "one config entry"

## Open Questions

- **Where the badge appears in the list screen** — **Assumption:** detail only, because the 2-column card has no room at 375pt without crowding the title. Revisit if the demo needs it on the card.

## Resolved Decisions

- The badge label lives in `merchantConfig.labels.winterCollection`, not in the screen — the
  standards' example hardcodes `'WINTER COLLECTION'`; US-002 overrides it, so `MerchantConfig`
  grew a `labels` block alongside `features`.
- The badge row is wrapped in one conditional, for layout only: an empty flex row still
  consumes one of the column's `s12` gaps, which is exactly the hole quick-rule #5 forbids.
  Each `ProductBadge` still owns its own absence — the guard is not a data check.
- Two filled accent badges were reviewed side by side on the simulator and read as deliberate,
  not noisy. The outline treatment floated in Technical Considerations was not built.
- US-001 required no code: the identifier, the domain field and `readBoolean` all shipped with
  PRD 002. Confirmed against the live Storefront — `northstar-essential` returns `"true"`,
  `everyday-tee` returns `null` → `undefined`.

## Verification

Simulator (iPhone 17, iOS 26.5), temporary `initialRouteName` on the stack — never a synthetic
cursor event, and the deep link was not reinstated:

- `northstar-essential` → `BEST SELLER` + `WINTER COLLECTION` side by side, `s8` gap
- `everyday-tee` → no badge, no gap: title → price → divider
- `features.winterCollection: false` → `BEST SELLER` alone, layout identical to pre-change
