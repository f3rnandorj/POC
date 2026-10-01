# PRD: Home and Collections

**Status:** draft
**Started:** 2026-10-01
**Source:** README — CASE 1 navigation tree (Home → Featured Products / Collections)

## Overview

Completes the navigation tree the README draws: a Home screen with featured products and the merchant's collections, feeding into the existing product list. Scheduled after the metafield blocks because the EMV does not need it — this is Case 1 finished, not the critical path.

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
- Exercised at 375pt

## User Stories

### US-001: Collection domain

As a developer, I want collections through the same pipeline as products so that no new pattern enters the codebase.

**Depends on:** —
**Complexity:** 4/10

**Acceptance Criteria:**
- [ ] `domain/Collection/` scaffolded from `templates/shopify-domain.md`
- [ ] `collectionQueries.ts` fetches collections with title, handle and image
- [ ] A second document fetches products by collection handle, reusing the product card fragment
- [ ] `collectionAdapter.ts` flattens edges/nodes and reuses `productAdapter.toProduct` for nested products
- [ ] `useCollectionGetList` and `useCollectionGetProducts` hooks
- [ ] `domain/Collection/index.ts` exports useCases + types only

### US-002: Featured products on Home

As a user, I want a few highlighted products on the landing screen so that the app opens with something to look at.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `screens/HomeScreen/HomeScreen.tsx` renders a horizontal featured row using `useProductGetList`
- [ ] Reuses `ProductCard` — no second card component
- [ ] Section heading uses the `titleMedium` variant
- [ ] Loading and empty states designed

### US-003: Collections on Home

As a user, I want to browse by collection so that the catalog has structure.

**Depends on:** US-001, US-002
**Complexity:** 4/10

**Acceptance Criteria:**
- [ ] Collections render below the featured row
- [ ] Tapping one navigates to the product list with the collection handle as a typed param
- [ ] The product list screen handles both modes: all products, or scoped to a collection
- [ ] The scoped list shows the collection title
- [ ] An empty collection renders a designed empty state

### US-004: Home as the entry screen

As a user, I want the app to open on Home so that the navigation matches the README's tree.

**Depends on:** US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] `AppStack` opens on `HomeScreen`
- [ ] `AppStackParamList` types the optional collection handle on the list route
- [ ] Back navigation returns to Home from any depth

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
