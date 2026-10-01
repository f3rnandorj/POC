# PRD: Shopify Product Data Layer

**Status:** draft
**Started:** 2026-10-01
**Source:** README — CASE 1 "Requisito técnico" (Storefront API + GraphQL)

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
- [ ] `react-native-config` installed and wired on iOS
- [ ] `.env` holds `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_TOKEN`, `SHOPIFY_API_VERSION`; `.env` is gitignored
- [ ] `.env.example` is tracked and holds key names only, no values
- [ ] `config/merchant/merchantConfig.ts` is the single consumer of those vars
- [ ] `config/merchant/merchantTypes.ts` declares `MerchantConfig` with `credentials`, `theme`, `features`
- [ ] No token literal anywhere in the tree

### US-002: Storefront client

As a developer, I want one HTTP client for the Storefront API so that every query shares headers, version pin and error handling.

**Depends on:** US-001
**Complexity:** 4/10

**Acceptance Criteria:**
- [ ] `api/shopify/client.ts` posts to `https://{domain}/api/{version}/graphql.json`
- [ ] Headers: `X-Shopify-Storefront-Access-Token` + `Content-Type: application/json`
- [ ] API version comes from config and is pinned, never templated from user input
- [ ] A response carrying a top-level `errors` array **throws**, even on HTTP 200
- [ ] The thrown error carries a message safe to display; the raw payload is not attached
- [ ] No logging of headers or full request

### US-003: Query documents and fragments

As a developer, I want the GraphQL documents isolated so that no query string lives in a service, hook or screen.

**Depends on:** US-002
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `domain/Product/productQueries.ts` exports `PRODUCT_LIST_QUERY` and `PRODUCT_BY_HANDLE_QUERY`
- [ ] `api/shopify/fragments.ts` holds the shared product-card selection and the metafield identifier list
- [ ] The metafield selection requests `custom.badge`, `custom.material`, `custom.promotion_text`, `custom.is_winter_collection` by explicit identifier
- [ ] Detail query returns images, `priceRange`, variants (`id`, `title`, `availableForSale`) and `description`
- [ ] Zero query strings outside this file

### US-004: Domain model and raw types

As a developer, I want a `Product` type the UI can consume so that no screen ever sees a Storefront shape.

**Depends on:** —
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `productTypes.ts` declares `Product`, `ProductVariant`, `ProductMetafields` — domain model first
- [ ] Raw Storefront shapes live below, suffixed `Api` (`ProductApi`, `MetafieldApi`)
- [ ] `ProductMetafields` fields are all optional
- [ ] `price` is `{ amount, currencyCode }` — unformatted

### US-005: Adapter

As a developer, I want all mapping in one pure module so that a Storefront shape change touches exactly one file.

**Depends on:** US-003, US-004
**Complexity:** 5/10

**Acceptance Criteria:**
- [ ] `productAdapter.ts` flattens `edges`/`node` — the only file that knows those words
- [ ] `toMetafields` tolerates a **positional array containing `null`**: it indexes by `key`, never by position
- [ ] `value` is always a string: `boolean` → `value === 'true'`; `json` → `JSON.parse` inside try/catch
- [ ] A parse failure yields `undefined` and does not throw
- [ ] A missing metafield yields `undefined` — never `''`, `'—'` or `null`
- [ ] Functions declared first, `export const productAdapter = { ... }` closes the file
- [ ] The Everyday Tee (four `null`s) maps without a crash

### US-006: Api and service

As a developer, I want raw calls and delegation separated so that each layer has one reason to change.

**Depends on:** US-005
**Complexity:** 2/10

**Acceptance Criteria:**
- [ ] `productApi.ts` executes the documents and returns the raw payload, zero transformation
- [ ] `productService.ts` calls api then adapter; no React import
- [ ] Both export their singleton object as the last statement in the file

### US-007: UseCase hooks

As a screen, I want hooks returning UI-ready data so that I never touch the service.

**Depends on:** US-006
**Complexity:** 3/10

**Acceptance Criteria:**
- [ ] `useCases/useProductGetList.ts` exports `useProductGetList()` returning `{ products, isLoading, error, refetch }`
- [ ] `useCases/useProductGetDetail.ts` exports `useProductGetDetail(handle)`
- [ ] Query keys come from the `QueryKeys` enum
- [ ] These are the only `useQuery` callers in the codebase
- [ ] `domain/Product/index.ts` exports **useCases + productTypes only** — importing `productService` from `@domain` is impossible

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

## Open Questions

- **Which identifier the detail query uses** — **Assumption:** `handle`, because it is stable, readable in a route param and already returned by the list query. Switch to `id` only if a handle collision appears.
