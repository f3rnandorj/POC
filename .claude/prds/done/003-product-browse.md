# PRD: Product Browse (List → Detail)

**Status:** done
**Completed:** 2026-10-01
**Started:** 2026-10-01
**Source:** README — CASE 1 "A Product Detail deve mostrar" + the EMV minimum journey

## Overview

The two screens that carry the demo: a product list and a product detail showing image, title, price, variants and availability. This block closes the EMV core — Shopify → GraphQL → React Native, on screen, with real data.

## Goals

- Both live products render from the Storefront API
- The sold-out variant is visibly distinguishable from the available ones
- Loading, empty and error states are designed, not library defaults

## Standards Referenced

- `.claude/standards/design.md` — identity, 2-column grid, section rhythm, validation widths
- `.claude/standards/frontend.md` — component conventions
- `.claude/standards/architecture.md` — screens are thin, boundary gate
- `.claude/standards/code-style.md` — component size limit, no inline utilities

## Decisions Referenced

- 2026-09-30 — Design identity: streetwear, neutral + one accent, compact density
- 2026-09-30 — No test layer; the simulator is the gate
- 2026-10-01 — Screens carry the `Screen` suffix, no per-screen barrel

## Quality Gates

- ~~Exercised on a 375pt device **and** a large one~~ — superseded 2026-10-01: `standards/design.md` no longer requires the small/large matrix, one simulator is enough. Exercised on iPhone 17.
- A 3-line title and a long description do not push content off screen
- No `@api/shopify` import and no `*Api` type under `screens/` or `components/`

## User Stories

### US-001: ProductCard

As a user, I want each product summarized consistently so that the list is scannable.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `components/ProductCard/ProductCard.tsx`, re-exported from the root `components/index.ts`, no local barrel
- [x] Props are domain-typed (`Product`), never a Storefront shape
- [x] Renders image, title, formatted price
- [x] Price formatting lives in `utils/priceUtils.ts`, not inline
- [x] Restyle props only

### US-002: ProductListScreen

As a user, I want to see the merchant's products so that I can pick one.

**Depends on:** US-001
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] `screens/ProductListScreen/ProductListScreen.tsx` consumes `useProductGetList`
- [x] 2-column grid, `s8` gap, `s16` screen gutter
- [x] Loading, empty and error states follow the identity — type and accent, no spinner-on-white
- [x] Tapping a card navigates to the detail with the product handle
- [x] Screen file under 150 lines

### US-003: ProductDetailScreen base

As a user, I want the product's core information so that I know what I am looking at.

**Depends on:** US-002
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] Consumes `useProductGetDetail(handle)`
- [x] Layout order: image → title → price → (badge slot) → (metadata slot) → description
- [x] Sections separated by a single hairline, not by cards
- [x] Badge and metadata slots are left empty in this block — PRD 004 fills them
- [x] Loading and error states designed

### US-004: Variants and availability

As a user, I want to see which colors exist and which are sold out so that I am not misled.

**Depends on:** US-003
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] A variant picker renders one chip per variant, `surface` background, `s2` radius
- [x] Selecting a variant updates the selection visually using the `accent` token
- [x] A variant with `available: false` is visibly distinct and not selectable
- [x] The Blue variant of Northstar Essential renders as sold out against the live store
- [x] The Everyday Tee, whose only variant is `Default Title`, does not render a single meaningless chip
- [x] The picker is a sibling component under the screen's `components/` folder, which has an `index.ts`

### US-005: Add to cart affordance

As a user, I want the primary action visible so that the screen reads as a product page.

**Depends on:** US-004
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] A full-width CTA renders with `accent` fill and `accentText` label
- [x] Disabled when the selected variant is unavailable
- [x] Pressing it does nothing beyond local feedback — cart and checkout are out of scope
- [x] A `ponytail:` comment names the ceiling and the upgrade path

## Functional Requirements

- FR-1: The list renders every product returned by the Storefront API
- FR-2: The detail renders image, title, price, description, variants and availability
- FR-3: Navigation passes the product handle, typed through `AppStackParamList`
- FR-4: No screen or component imports from `@api/shopify`

## Non-Goals

No Home screen, no collections, no metafields, no search, no filters, no real cart, no pagination UI, no image carousel beyond the first image.

## Technical Considerations

- A single-variant product arrives as `Default Title` from Shopify. Rendering that as a chip is noise; the picker hides itself when there is one variant with no meaningful name.
- `availableForSale` is already computed by Shopify from tracking + "continue selling". The UI reads the flag and never recomputes it from quantity.
- The grid must hold at 375pt — that width is part of the gate, not a follow-up.

## Success Metrics

- A 5-minute demo runs list → detail → sold-out variant without touching the admin
- Both live products render correctly, including the one with no variants

## Execution notes (2026-10-01)

- **Variant selection on mount** — kept the assumption: the first *available* variant is preselected. Verified live (BLACK preselected, BLUE sold out and unselectable, WHITE selectable).
- **A back control was added** (`components/BackControl.tsx`), beyond the ACs. The stack runs `headerShown: false` to keep the image full-bleed, which left the iOS edge-swipe as the only way off the detail screen — unusable for anyone who cannot perform the gesture, and a dead end when the gesture fails. Accessibility basics are not simplified away.
- **Deep links were added and then removed.** They went in so screens could be opened without synthetic mouse events (which move the developer's real cursor), but iOS 26 shows an "Open in …?" confirmation for a custom scheme opened from outside, so they never became hands-free — verification used a temporary render change instead. With push out of scope by the README and no web surface, nothing else consumed them, and they would have needed the handle shape-check `security.md` requires for URL params. Removed at the user's call: `routes/linking.ts`, the `NavigationContainer linking` prop, `CFBundleURLTypes` and the `RCTLinkingManager` handler in the AppDelegate are all gone.

## Open Questions

- **Product images are placeholders.** Both products carry `WhatsAppImage2026-07-17….jpg` — screenshots of an Apple receipt. The app renders them correctly, but `design.md` puts the product photo at the centre of the screen, so the demo reads wrong until they are replaced in the Shopify admin.
