# PRD: Shopify Product Data Layer

**Status:** done
**Completed:** 2026-10-01
**Started:** 2026-10-01
**Source:** technical requirement — Storefront API + GraphQL

## Overview

Build the full path from the Storefront API to a domain `Product`: merchant config, the GraphQL client, the query documents, the adapter and the useCase hooks. No screen work — this block is done when a hook returns two typed products with the sold-out variant flagged.

## Goals

- One GraphQL request fills everything the Product Detail will need
- Nothing above the adapter knows the words `edges`, `node` or `metafields`
- The Storefront token never appears in a tracked file
- A missing metafield surfaces as `undefined`, never `null` or `''`

## Standards Referenced

- `.claude/standards/shopify.md` — client, query conventions, the metafield contract
- `.claude/standards/security.md` — token handling, no logging of headers
- `.claude/standards/architecture.md` — layer rules, domain barrel
- `.claude/templates/shopify-domain.md` — the scaffold to copy

## Decisions Referenced

- 2026-09-30 — Storefront API + GraphQL, version-pinned; Admin API never reaches the device
- 2026-09-30 — API-Bound infra (service → api → adapter), no repository interfaces
- 2026-09-30 — Metafields queried by explicit identifier; adapter owns parsing
- 2026-10-01 — Singleton objects export last; domain barrel never exports the service

## Quality Gates

- A temporary debug render shows both product titles pulled from the live store
- `bash .claude/scripts/check-security.sh` clean (this block touches the token)
- `yarn tsc --noEmit` clean

## User Stories

### US-001: Merchant config and environment

As a developer, I want the store domain, token and API version read from the environment so that no credential is committed.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `react-native-config` installed and wired on iOS
- [x] `.env` holds `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_API_VERSION`; `.env` is gitignored
- [x] `.env.example` is tracked and holds key names only, no values
- [x] `config/merchant/merchantConfig.ts` is the single consumer of those vars
- [x] `config/merchant/merchantTypes.ts` declares `MerchantConfig` with `credentials`, `theme`, `features`
- [x] No token literal anywhere in the tree

### US-002: Storefront client

As a developer, I want one HTTP client for the Storefront API so that every query shares headers, version pin and error handling.

**Depends on:** US-001
**Complexity:** 4/10

**Acceptance Criteria:**
- [x] `api/shopify/client.ts` posts to `https://{domain}/api/{version}/graphql.json`
- [x] Headers: `X-Shopify-Storefront-Access-Token` + `Content-Type: application/json`
- [x] API version comes from config and is pinned, never templated from user input
- [x] A response carrying a top-level `errors` array **throws**, even on HTTP 200
- [x] The thrown error carries a message safe to display; the raw payload is not attached
- [x] No logging of headers or full request

### US-003: Query documents and fragments

As a developer, I want the GraphQL documents isolated so that no query string lives in a service, hook or screen.

**Depends on:** US-002
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `domain/Product/productQueries.ts` exports `PRODUCT_LIST_QUERY` and `PRODUCT_BY_HANDLE_QUERY`
- [x] `api/shopify/fragments.ts` holds the shared product-card selection and the metafield identifier list
- [x] The metafield selection requests `custom.badge`, `custom.material`, `custom.promotion_text`, `custom.is_winter_collection` by explicit identifier
- [x] Detail query returns images, `priceRange`, variants (`id`, `title`, `availableForSale`) and `description`
- [x] Zero query strings outside this file

### US-004: Domain model and raw types

As a developer, I want a `Product` type the UI can consume so that no screen ever sees a Storefront shape.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `productTypes.ts` declares `Product`, `ProductVariant`, `ProductMetafields` — domain model first
- [x] Raw Storefront shapes live below, suffixed `Api` (`ProductApi`, `MetafieldApi`)
- [x] `ProductMetafields` fields are all optional
- [x] `price` is `{ amount, currencyCode }` — unformatted

### US-005: Adapter

As a developer, I want all mapping in one pure module so that a Storefront shape change touches exactly one file.

**Depends on:** US-003, US-004
**Complexity:** 5/10

**Acceptance Criteria:**
- [x] `productAdapter.ts` flattens `edges`/`node` — the only file that knows those words
- [x] `toMetafields` tolerates a **positional array containing `null`**: it indexes by `key`, never by position
- [x] `value` is always a string: `boolean` → `value === 'true'`; `json` → `JSON.parse` inside try/catch
- [x] A parse failure yields `undefined` and does not throw
- [x] A missing metafield yields `undefined` — never `''`, `'—'` or `null`
- [x] Functions declared first, `export const productAdapter = { ... }` closes the file
- [x] The Everyday Tee (four `null`s) maps without a crash

### US-006: Api and service

As a developer, I want raw calls and delegation separated so that each layer has one reason to change.

**Depends on:** US-005
**Complexity:** 2/10

**Acceptance Criteria:**
- [x] `productApi.ts` executes the documents and returns the raw payload, zero transformation
- [x] `productService.ts` calls api then adapter; no React import
- [x] Both export their singleton object as the last statement in the file

### US-007: UseCase hooks

As a screen, I want hooks returning UI-ready data so that I never touch the service.

**Depends on:** US-006
**Complexity:** 3/10

**Acceptance Criteria:**
- [x] `useCases/useProductGetList.ts` exports `useProductGetList()` returning `{ products, isLoading, error, refetch }`
- [x] `useCases/useProductGetDetail.ts` exports `useProductGetDetail(handle)`
- [x] Query keys come from the `QueryKeys` enum
- [x] These are the only `useQuery` callers in the codebase
- [x] `domain/Product/index.ts` exports **useCases + productTypes only** — importing `productService` from `@domain` is impossible

## Functional Requirements

- FR-1: One request returns everything the Product Detail screen needs
- FR-2: The token is read from the environment at runtime, never embedded in source
- FR-3: A Storefront `errors` array becomes a thrown typed error
- FR-4: Absent metafield → `undefined` in the domain model

## Non-Goals

No screens, no Collection domain, no cart, no checkout, no OAuth, no metaobjects, no pagination beyond `first: N`.

## Technical Considerations

- The live store returns `[null, null, null, null]` for the Everyday Tee — verified by curl on 2026-10-01. Indexing the metafield array by position crashes on that product; this is the single highest-risk line in the block.
- `value` is a string for every type, including `boolean`. `"true"` is not `true`.
- A Storefront error arrives with HTTP 200. Checking `response.ok` is not error handling.
- A correct query against a definition without Storefront access returns `null` — a data problem, not a code problem.

## Success Metrics

- A throwaway `<Text>{products[0].title}</Text>` renders `Northstar Essential` from the live store
- The Everyday Tee renders with no metafield and no crash

## Resolved Decisions (2026-10-01)

- **API version** → `2026-07`, pinned. Validated by curl against the live store.
- **Store currency** → USD. The store was created in USD; the README's `R$` is prose, the EMV uses `$`.
- **Metafield namespace** → `custom`, the admin default used when the four definitions were created.

## Execution notes (2026-10-01)

- **Which identifier the detail query uses** — kept `handle`, as assumed. Exercised live against both products.
- **No HTTP dependency.** `fetch` is built into React Native, so the client is a plain POST with two headers — axios/`graphql-request` would have earned nothing here.
- **Fragments are split `Core` / `Card`.** The first cut had `images` in the shared card fragment at `first: 1` while the detail query asked for `first: 10`; GraphQL rejects that outright (`Field 'images' has an argument conflict`) and the whole detail query failed. `ProductCore` now holds everything both screens share **except** `images`, and each query selects its own page size.
- **Metafield identifiers live in `merchantConfig`** and `fragments.ts` renders them into the selection, so a merchant with different keys is a config change (standards/shopify.md rule 4).

## Open Questions

- ~~**`care_instructions` returns `null` for BOTH products**~~ — **RESOLVED 2026-10-01.** The definition was created as type JSON with Storefront access enabled and populated on Northstar Essential only. Verified by curl: the value arrives as a JSON **string**, Everyday Tee as `null`. PRD 006 US-001 is satisfied; the block is unblocked.
- **No `json` metafield exists yet**, so the US-005 acceptance line about `JSON.parse` inside try/catch has no subject in this block. The parser lands with `care_instructions` in PRD 006 via `templates/metafield-feature.md`; writing it now would be a helper with no caller.
