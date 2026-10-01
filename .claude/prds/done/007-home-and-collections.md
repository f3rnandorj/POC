# PRD: Home and Collections

**Status:** done
**Shipped:** 2026-10-01
**Started:** 2026-10-01
**Source:** navigation requirement — Home → Featured Products / Collections

## Overview

Completes the navigation tree: a Home screen with featured products and the merchant's collections, feeding into the existing product list. Scheduled after the metafield blocks because the EMV does not need it — it finishes the browse story, it is not the critical path.

## Goals

- Home renders featured products and the store's collections
- Tapping a collection opens the product list scoped to it
- The Collection domain follows the same shape as Product, with no new architectural concept

## Standards Referenced

- `.claude/templates/shopify-domain.md` — the domain scaffold, copied for `Collection`
- `.claude/standards/architecture.md` — domain folder shape, barrels
- `.claude/standards/design.md` — layout rhythm, section headings

## Decisions Referenced

- 2026-09-30 — API-Bound infra; one transport, no repository interfaces
- 2026-10-01 — Singleton objects export last; domain barrel never exports the service

## Quality Gates

- Home → collection → product list → detail runs end to end on the simulator
- Collections with zero products render a designed empty state, not a blank screen
- Exercised with long content on the one running simulator — not on a 375pt device (quick-rule #11, ADR 2026-10-01 "Um simulador, nunca uma matriz de devices")

## User Stories

### US-001: Collection domain

As a developer, I want collections through the same pipeline as products so that no new pattern enters the codebase.

**Depends on:** —
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] `domain/Collection/` scaffolded from `templates/shopify-domain.md`
- [x] `collectionQueries.ts` fetches collections with title, handle and image
- [x] A second document fetches products by collection handle, reusing the product card fragment
- [x] `collectionAdapter.ts` flattens edges/nodes and reuses `productAdapter.toProduct` for nested products
- [x] `useCollectionGetList` and `useCollectionGetProducts` hooks
- [x] `domain/Collection/index.ts` exports useCases + types only

### US-002: Featured products on Home

As a user, I want a few highlighted products on the landing screen so that the app opens with something to look at.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `screens/HomeScreen/HomeScreen.tsx` renders a horizontal featured row using `useProductGetList`
- [x] Reuses `ProductCard` — no second card component
- [x] Section heading uses the `titleMedium` variant
- [x] Loading and empty states designed

### US-003: Collections on Home

As a user, I want to browse by collection so that the catalog has structure.

**Depends on:** US-001, US-002
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] Collections render below the featured row
- [x] Tapping one navigates to the product list with the collection handle as a typed param
- [x] The product list screen handles both modes: all products, or scoped to a collection
- [x] The scoped list shows the collection title
- [x] An empty collection renders a designed empty state

### US-004: Home as the entry screen

As a user, I want the app to open on Home so that the navigation matches the README's tree.

**Depends on:** US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `AppStack` opens on `HomeScreen`
- [x] `AppStackParamList` types the optional collection handle on the list route
- [x] Back navigation returns to Home from any depth

## Functional Requirements

- FR-1: Home shows featured products and collections
- FR-2: A collection opens a scoped product list
- FR-3: The Collection domain mirrors the Product domain's structure exactly

## Non-Goals

No search, no sorting, no filters, no nested collections, no banners, no merchandising rules, no pagination UI.

## Technical Considerations

- The dev store has no collections yet. Creating two in the admin and publishing them to the Headless channel is a prerequisite of US-001, same as the metafield setup was for PRD 004 — an unpublished collection returns nothing with no error.
- "Featured" has no Shopify concept behind it here. It is the first N products, and a `ponytail:` comment says so with the upgrade path (a `featured` collection handle in config).
- The product list screen gains one optional param. It must not fork into two screens.

## Success Metrics

- The full README navigation tree is walkable in the demo
- Adding the Collection domain introduced no new layer, hook pattern or folder convention

## Open Questions

- **How many featured products** — **Assumption:** the first 6 from the list query, because the store has 2 and any cap is arbitrary until a real catalog exists.

## Resolved Decisions

- `collectionAdapter` imports `productAdapter` by relative path, past the Product barrel. The
  barrel exports useCases + types only (quick-rule #10), and a collection's nested products must
  come out of the same mapper the grid uses — a second `toProduct` is the drift that rule exists
  to prevent. The exception is commented at the import.
- The list screen serves both scopes with one hook pair, each disabled in the other's mode
  (`useProductGetList(!collectionHandle)` / `useCollectionGetProducts(handle)`). No second screen,
  no wasted request.
- `BackControl` moved to `@components` and gained an optional `top`: floating over the detail's
  full-bleed image, in normal flow on the list. The list is no longer the stack root, so the
  edge-swipe would have been its only way out.
- "Featured" is the first 6 products with a `ponytail:` comment naming the upgrade path — Shopify
  has no featured concept and the store has 2 products.

## Fixed Along the Way (pre-existing defects this block exposed)

1. **React Query v5 rejects `undefined` as cached data.** `productService.byHandle` and
   `collectionService.productsByHandle` both return `undefined` for "not found", which surfaced as
   *"Query data cannot be undefined"* and an error screen instead of the designed empty state. Both
   useCases now send `null` across the cache and hand the UI back `undefined`, so the screens'
   absent-case contract is unchanged. The product-detail path had the same hole since PRD 002 — it
   was never exercised because every handle tested existed.
2. **`numColumns={2}` stretches the last card of an odd row.** A collection with 1, 3 or 5 products
   rendered its final card full-bleed. Capped with `maxWidth="50%"` on the item wrapper.

## Verification

Simulator (iPhone 17, iOS 26.5), each screen reached by a temporary `initialRouteName`/
`initialParams`, all reverted:

- Home → `Shop` title, `FEATURED` horizontal row with both products, `All products` action,
  `COLLECTIONS` listing `Home page` (no image → `surface` block holds the row height)
- `ProductList` with `collectionHandle: 'frontpage'` → heading `Home page`, 1 product, card capped
  at half width
- `ProductList` with an unpublished handle → `NOTHING HERE YET` / "This collection has no published
  products.", no error box
- `ProductList` with no params → `All products`, 2 columns
- `BACK` renders inline above the list heading

## Closing notes

- **Merchant data, done by the user on 2026-10-01**: `frontpage` renamed to "Winter Collection"
  (Northstar Essential) and a new `essentials` → "Essentials" (Everyday Tee). Both render on Home.
  Neither has an image, so both rows show the `surface` block — the validated path.
- **The tap-through** Home → collection → list → detail → back was run by the user, not by the
  model: each leg was verified here by rendering the screen directly, and driving the simulator
  with synthetic cursor events is forbidden (ADR 2026-10-01).
- **Open cosmetic item, deliberately not fixed**: the first collection still carries Shopify's
  default `frontpage` handle — the admin rename changed the title, not the identifier. Nothing in
  the code references it, so the app is unaffected. Its title also overlaps the
  `is_winter_collection` metafield badge from PRD 005; the two mechanisms are unrelated and a demo
  may want them named apart.
