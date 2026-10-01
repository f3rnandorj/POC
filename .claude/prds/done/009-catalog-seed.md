# PRD: Catalog Seed — Products, Collections and Variants

**Status:** done
**Shipped:** 2026-10-01
**Started:** 2026-10-01
**Source:** demo requirement — the app must not look empty when shown

## Overview

The store holds 2 products and 2 collections, and neither collection has a cover image. Every screen reads as a stub. This block seeds enough real content that Home, the collection lists and Product Detail look like an app instead of a fixture: around ten products, the two existing collections filled and given cover images, variants where they make sense, and metafields spread unevenly on purpose.

Deliberately small. The point is a populated app, not a catalog.

## Before execution — walk the user through the setup first

**When the user asks to run this block, do not start writing the script.** This block needs manual
steps in the Shopify admin that only the user can do. Guide them through it, confirm each one is
done, then implement.

What is needed before the first line of code:

1. **A custom app in the admin** — Settings → Apps and sales channels → Develop apps → Create an app.
2. **Admin API scopes on that app** — `write_products` (products, variants, collections, metafields)
   and `write_publications` (publishing to the Headless channel).
3. **The Admin API access token** (`shpat_…`), installed and revealed once. The user holds it; it is
   exported in the shell for the run and never written to `.env`, the repo, or any tracked file.
4. **The Headless channel's publication id** — everything seeded must be published to it, or the
   Storefront API cannot see it and the app looks broken for a reason no code explains.
5. **Metafield definitions with Storefront access enabled** for all five identifiers in
   `merchantConfig`. Already true if 004 shipped — verify, do not assume.

### Why a script and not the CLI or an MCP server

Settled on 2026-10-01, do not re-derive:

- **Shopify CLI** has no catalog CRUD. It covers app, theme and hydrogen workflows only, and it is
  not installed on this machine.
- **The official Shopify Dev MCP** reads docs and introspects the Admin schema. It does not write to
  a store.
- **Third-party Shopify MCP servers** do write, but that means installing an unaudited server and
  handing it an Admin token for work one local script does.

So: Admin GraphQL from `scripts/seed-catalog.mjs`, token from the shell environment.

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
- [x] The five setup items above were walked through with the user and each confirmed done — this US is a conversation, not code
- [x] A custom app exists in the admin with `write_products` and `write_publications`
- [x] The Admin token is passed through the shell environment at run time — never into `.env`, never into a tracked file
- [x] `scripts/seed-catalog.mjs` is dev tooling: nothing under `src/` imports it, and the app keeps reading only the Storefront API

### US-002: Source the content

As the author, I want real copy and real photos so that the app does not look like lorem ipsum.

**Depends on:** US-001
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] Around 10 products total, apparel, consistent with the existing two — not inflated
- [x] Title, description, product type, vendor and price per product, written to read as a real store
- [x] Photos from a free-license source (Unsplash / Pexels), referenced by public URL so Shopify downloads them — no staged upload step
- [x] One cover image per collection: one reading as Winter Collection, one as Essentials
- [x] Image URLs recorded in the script so a rerun fetches the same photos

### US-003: Variants

As a user, I want size and colour choices on some products so that the variant UI has something to show.

**Depends on:** US-002
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] At least 3 products carry a real option set (size, or size + colour)
- [x] At least one variant is out of stock, so `availableForSale` is exercised
- [x] At least one product stays single-variant, so that path still renders
- [x] Variant prices differ on at least one product
- [x] `productCreate` with inline options generates only one default variant — the rest are added explicitly with `productVariantsBulkCreate`

### US-004: Collections filled and covered

As a user, I want both collections to look curated so that the Home screen is worth tapping.

**Depends on:** US-003
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] Winter Collection (`frontpage`) holds at least 4 products
- [x] Essentials holds at least 4 products
- [x] Both have a cover image set via `collectionUpdate`
- [x] A product may sit in both; at least one sits in neither, so an unscoped product exists
- [x] Both are published to the Headless channel

### US-005: Metafields spread unevenly

As a user, I want some products richer than others so that the app shows both the present and the absent case.

**Depends on:** US-004
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `custom.is_winter_collection` set on the Winter Collection products only
- [x] `custom.badge` and `custom.promotion_text` on a couple of products, not all
- [x] `custom.material` and `custom.care_instructions` on some, with values written as a real merchant would
- [x] At least 2 products carry **no** metafields at all, so Product Detail renders nothing extra — no placeholder, no dash
- [x] Every value matches its definition's type; a mismatch is rejected by the Admin API and must not be worked around with a cast

### US-006: Verify through the app

As the author, I want the seed checked where it will be shown so that nothing surprises me live.

**Depends on:** US-005
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] A Storefront query confirms counts: products, each collection's products, both collection images non-null
- [x] Home and both collection lists scrolled on the running simulator
- [x] One rich product and one bare product opened in Product Detail, side by side in the walkthrough
- [x] No image renders broken or sideways

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

## Resolved Decisions

- **`productSet` with `identifier: { handle }`, not `productCreate` + `productVariantsBulkCreate`.**
  The PRD's Technical Considerations assumed two writes per product; `ProductSetInput` takes
  options, variants, media, metafields and collection membership together, and the identifier is
  what makes it an upsert. Without the identifier it always creates and a rerun dies on "handle
  already in use" — which is exactly how the first run failed.
- **Availability is expressed by inventory tracking, not by stock counts.** A tracked variant
  starts at zero and reads as sold out; an untracked one is always available. Writing real
  quantities needs `read_locations` plus a location id, which buys nothing for a demo. A
  `ponytail:` comment names the upgrade path.
- **Collection membership is declared in the product input**, not through `collectionAddProducts`,
  so a product moved between collections in `catalog.mjs` is corrected on the next run instead of
  accumulating in both.
- **The content lives in `catalog.mjs`, the machinery in `seed-catalog.mjs`.** Changing a photo or
  a price is editing data; it should not mean reading GraphQL.
- **The Admin token lives in `~/.config/northstar-poc/admin-token.sh` (mode 600), not in the
  scratchpad.** `/private/tmp` is session-scoped and Shopify reveals an Admin token exactly once —
  losing it means uninstalling and reinstalling the app. Never in `.env`, never in the repo.

## The photo problem, and what it cost

The first pass chose photos by "does the URL resolve" instead of "does the image serve". It shipped:

- a flat lay with **Puma** shoes and two **Champion** items in frame, on a store meant to sell its
  own clothes;
- a hooded figure in a **Guy Fawkes mask** as the work jacket;
- four moody portraits next to two clean studio shots, so the grid read as a stock-photo grab bag.

Three libraries were checked — Unsplash, Pexels and Shopify's own Burst. None has a *garment alone
on a black background* set: photographers shooting an isolated garment use white, and photographers
shooting dark use a person. The store's two original products avoid this only because their images
were **AI-generated** (`ChatGPT_Image_*.png` in the store's files).

So the catalogue standardises on **light** instead: dark UI, light product tile, the way most
apparel storefronts do it. The product line was then rewritten around photos that exist and are
free — there is no hoodie in the catalogue because there is no free hoodie-alone shot, and
inventing the product and pairing it with a portrait is how the first pass went wrong.

Replacing the line meant six products from the first pass were orphaned. **The model is not
permitted to delete store data**: the deletion step was written, refused by the harness, and the
user removed those six in the admin. The script therefore seeds and restyles but never deletes —
which is the right shape for it anyway.

## Verification

Storefront API after the final run — 10 products, both collections with a cover:

| Product | Variants | Sold out | Metafields |
|---|---|---|---|
| Northstar Essential | 3 | Blue | 5 |
| Everyday Tee | 1 | — | 0 |
| Knit Beanie | 1 | — | 2 |
| Cotton Cap | 1 | — | 0 |
| Long Sleeve Tee | 3 | — | 3 |
| Denim Work Jacket | 3 | XL | 4 |
| Heavy Crew Tee | 4 | S | 4 |
| Straight Leg Denim | 4 | — | 2 |
| Selvedge Denim | 3 | — | 2 |
| Boxy Tee | 3 | — | 0 |

Winter Collection 5 products, Essentials 5, Heavy Crew Tee in both, Cotton Cap in neither.
Idempotent: the script ran four times, the count stayed at 10.

Simulator (iPhone 17, iOS 26.5): Home scrolls with a filled featured row and both collection
covers; All products is a coherent grid of garments on light backgrounds, no people and no
third-party logos; `cotton-cap` carries no metafields and its detail renders title → price →
divider → description → CTA with nothing extra.

## Second photo pass

Two items found at review and fixed in the same session, both by editing one URL each:

- The **Knit Beanie** carried a woven patch reading "705" — a small label, but still a logo on a
  garment the store claims as its own. Replaced with an unbranded knit hat.
- The **collection covers** did not match: Winter was a dim store interior, Essentials a bright
  flat lay. Both now come from the same shoot, so they read as a pair.

Neither needed a code change, which is the point of keeping the content in `catalog.mjs`.
