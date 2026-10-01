# PRD: Catalog Seed — Products, Collections and Variants

**Status:** draft
**Started:** 2026-10-01
**Source:** demo requirement — the app must not look empty when shown

## Overview

The store holds 2 products and 2 collections, and neither collection has a cover image. Every screen reads as a stub. This block seeds enough real content that Home, the collection lists and Product Detail look like an app instead of a fixture: around ten products, the two existing collections filled and given cover images, variants where they make sense, and metafields spread unevenly on purpose.

Deliberately small. The point is a populated app, not a catalog.

## Goals

- Home, both collection lists and Product Detail all look filled
- The two collections carry cover images
- Metafield coverage is uneven, so the present **and** absent paths are both visible in the live app
- Seeding is a rerunnable script, not an afternoon in the admin UI

## Standards Referenced

- `.claude/standards/shopify.md` — metafield identifiers, Storefront access requirement, publication to the Headless channel
- `.claude/standards/security.md` — the Admin token never enters `.env`, the repo, or any tracked file

## Decisions Referenced

- 2026-10-01 — metafield absence renders nothing (quick-rule #5): the seed must include products that exercise it
- 2026-09-30 — Storefront API only at runtime; the Admin API appears in tooling, never in `src/`

## Quality Gates

- Every seeded product is visible through the Storefront API — published to the Headless channel, not just saved in the admin
- Every seeded metafield value is readable through the Storefront API (definitions have Storefront access enabled)
- The script is idempotent: a second run updates, it does not duplicate
- Home → each collection → detail scrolls through real content on the simulator already running

## User Stories

### US-001: Pick the upload path

As the author, I want the mechanism settled before any content is written so that the work is not redone.

**Depends on:** —
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] Admin GraphQL from a local script is the path; Shopify CLI has no catalog CRUD and no Shopify MCP is installed here
- [ ] A custom app exists in the admin with `write_products` and `write_publications`
- [ ] The Admin token is passed through the shell environment at run time — never into `.env`, never into a tracked file
- [ ] `scripts/seed-catalog.mjs` is dev tooling: nothing under `src/` imports it, and the app keeps reading only the Storefront API

### US-002: Source the content

As the author, I want real copy and real photos so that the app does not look like lorem ipsum.

**Depends on:** US-001
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] Around 10 products total, apparel, consistent with the existing two — not inflated
- [ ] Title, description, product type, vendor and price per product, written to read as a real store
- [ ] Photos from a free-license source (Unsplash / Pexels), referenced by public URL so Shopify downloads them — no staged upload step
- [ ] One cover image per collection: one reading as Winter Collection, one as Essentials
- [ ] Image URLs recorded in the script so a rerun fetches the same photos

### US-003: Variants

As a user, I want size and colour choices on some products so that the variant UI has something to show.

**Depends on:** US-002
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] At least 3 products carry a real option set (size, or size + colour)
- [ ] At least one variant is out of stock, so `availableForSale` is exercised
- [ ] At least one product stays single-variant, so that path still renders
- [ ] Variant prices differ on at least one product
- [ ] `productCreate` with inline options generates only one default variant — the rest are added explicitly with `productVariantsBulkCreate`

### US-004: Collections filled and covered

As a user, I want both collections to look curated so that the Home screen is worth tapping.

**Depends on:** US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] Winter Collection (`frontpage`) holds at least 4 products
- [ ] Essentials holds at least 4 products
- [ ] Both have a cover image set via `collectionUpdate`
- [ ] A product may sit in both; at least one sits in neither, so an unscoped product exists
- [ ] Both are published to the Headless channel

### US-005: Metafields spread unevenly

As a user, I want some products richer than others so that the app shows both the present and the absent case.

**Depends on:** US-004
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `custom.is_winter_collection` set on the Winter Collection products only
- [ ] `custom.badge` and `custom.promotion_text` on a couple of products, not all
- [ ] `custom.material` and `custom.care_instructions` on some, with values written as a real merchant would
- [ ] At least 2 products carry **no** metafields at all, so Product Detail renders nothing extra — no placeholder, no dash
- [ ] Every value matches its definition's type; a mismatch is rejected by the Admin API and must not be worked around with a cast

### US-006: Verify through the app

As the author, I want the seed checked where it will be shown so that nothing surprises me live.

**Depends on:** US-005
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] A Storefront query confirms counts: products, each collection's products, both collection images non-null
- [ ] Home and both collection lists scrolled on the running simulator
- [ ] One rich product and one bare product opened in Product Detail, side by side in the walkthrough
- [ ] No image renders broken or sideways

## Functional Requirements

- FR-1: The seed is reproducible from the script plus an Admin token
- FR-2: No source file under `src/` changes for this block
- FR-3: Nothing seeded is invisible to the Storefront API

## Non-Goals

No inventory realism, no pricing strategy, no SEO fields, no translations, no customer or order data, no third-party MCP server installed to do what a script does.

## Technical Considerations

- Two writes per product: `productCreate`, then `productVariantsBulkCreate` for the non-default variants — Shopify only generates the first option value as a variant.
- Media by URL (`productCreateMedia`, `originalSource`) skips `stagedUploadsCreate` entirely. Collection covers take `collectionUpdate` with `image: { src }`.
- Publication is the step that silently breaks everything: a product saved but unpublished is invisible to the Storefront API and the app looks broken for a reason nothing in the code explains.
- Idempotency keyed on handle: look the product up first, update if it exists. A second run must not create `everyday-tee-1`.
- `.env` holds Storefront variables only. The Admin token lives in the shell for the length of the run.

## Success Metrics

- Every screen has enough content to scroll
- Both the rich and the bare Product Detail can be shown back to back without hunting for a product

## Open Questions

- **Vendor name across products** — **Assumption:** all `Northstar`, matching the existing two.
- **Price currency** — **Assumption:** whatever the store is already configured for; the seed does not change store settings.
