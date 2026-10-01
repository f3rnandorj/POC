# PRD: Winter Collection Badge

**Status:** draft
**Started:** 2026-10-01
**Source:** README — CASE 3 + Requisito 4 ("The client wants a special badge for Winter Collection products")

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
- [ ] `custom.is_winter_collection` is already in the query from PRD 002 — confirmed, not re-added
- [ ] The adapter maps it to `isWinterCollection?: boolean` via `value === 'true'`
- [ ] A product that does not define it yields `undefined`, not `false`
- [ ] Northstar Essential arrives `true`; Everyday Tee arrives `undefined`

### US-002: Feature flag

As a platform, I want the capability gated per merchant so that enabling it for a second merchant is a config edit.

**Depends on:** US-001
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] `merchantConfig.features.winterCollection: boolean` exists and is typed
- [ ] The badge renders only when the flag is on **and** the product value is true
- [ ] The label text lives in config, not hardcoded in the screen
- [ ] Flag off → nothing renders, and no empty space remains

### US-003: Render through the existing badge

As a user, I want the Winter Collection marker on the product page so that I recognize the collection.

**Depends on:** US-002
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] The existing `ProductBadge` is reused — **no new badge component is created**
- [ ] The badge slot resolves its text in one expression and passes it down; `ProductBadge` still owns the null case
- [ ] Two badges on one product lay out side by side with `s8` gap, wrapping rather than overflowing at 375pt
- [ ] `<NorthstarWinterBadge />` does not exist in any form

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
- A reviewer can answer "what changes for the next merchant?" with "one config entry"

## Open Questions

- **Where the badge appears in the list screen** — **Assumption:** detail only, because the 2-column card has no room at 375pt without crowding the title. Revisit if the demo needs it on the card.
