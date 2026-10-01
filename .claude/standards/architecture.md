# Architecture

Domain-Driven + Service Layer, **API-Bound** infra (React Native CLI convention). Domains own their queries, api, adapter, service and use-case hooks. The Shopify Storefront API is the single transport; the domain layer is deliberately coupled to it — no repository interfaces, no DI container. That abstraction buys nothing for a one-transport POC.

## Data flow

```
Screen
  → useCase hook (src/domain/{Domain}/useCases/use{Domain}{Action}{Target}.ts)
    → {domain}Service (src/domain/{Domain}/{domain}Service.ts)
      → {domain}Api (src/domain/{Domain}/{domain}Api.ts)
        → shopifyClient (src/api/shopify/client.ts) → Shopify Storefront API
      ← {domain}Adapter (src/domain/{Domain}/{domain}Adapter.ts) ← maps Storefront response → domain model
    → React Query (useQuery / useMutation)
```

## Layer rules

| Layer | Responsibility | Must NOT |
|---|---|---|
| Screen | Render UI, call useCase hooks | Business logic, call service/api directly, read a Storefront field |
| UseCase hook | Orchestrate service + React Query, own the query key | Access api directly, know navigation internals |
| Service | Transform + delegate to api; throw typed errors | Know about React or hooks |
| Api | Execute the GraphQL document, return the raw Storefront payload | Transform data |
| Adapter | Map Storefront payload → domain model (pure functions) | Make network calls |
| Queries | Hold the GraphQL documents + fragments | Anything else |
| Client | `graphql-request`/axios instance + Storefront headers | Domain knowledge |
| Components | Presentational, Restyle-themed | Business logic, Shopify types |
| Config (`src/config/merchant`) | Per-merchant credentials, theme overrides, feature flags | Logic |

**Boundary gate (enforced in `pre-edit-validate.sh`):** nothing under `src/screens/` or `src/components/` may import from `@api/shopify` or reference a Storefront-shaped type (`*Api`, `edges`, `node`). UI talks to the domain model only.

## Folder structure

```
src/
  App.tsx
  api/
    shopify/
      client.ts                  ← graphql-request/axios + Storefront headers, version pin
      shopifyTypes.ts            ← shared raw Storefront types (MoneyV2, ImageEdge, MetafieldApi)
      fragments.ts               ← reusable GraphQL fragments (product card, metafields)
      index.ts
    index.ts
  domain/
    Product/
      productQueries.ts          ← GraphQL documents
      productApi.ts              ← raw calls only
      productService.ts          ← transforms + delegates; singleton object export
      productAdapter.ts          ← Storefront payload → Product (pure fns, owns metafield mapping)
      productTypes.ts            ← Product, ProductVariant, ProductMetafields + *Api raw types
      useCases/
        useProductGetList.ts       ← domain FIRST, verb after
        useProductGetDetail.ts
        index.ts
      index.ts                     ← useCases + productTypes ONLY — never the service
    Collection/
      ... same shape
    index.ts
  infra/
    infraTypes.ts                ← QueryKeys enum, MutationOptions<T>
    index.ts
  routes/
    Router.tsx
    AppStack.tsx
    types/navigationTypes.ts
    index.ts
  screens/
    HomeScreen/                  ← `Screen` suffix mandatory, no index.ts inside
      HomeScreen.tsx
      components/
        index.ts
    ProductListScreen/
      ProductListScreen.tsx
    ProductDetailScreen/
      ProductDetailScreen.tsx
      components/                ← ProductMetadata, ProductCare, VariantPicker
        index.ts
    index.ts                     ← export * from './HomeScreen/HomeScreen' …
  components/
    ProductCard/
      ProductCard.tsx
    ProductBadge/
      ProductBadge.tsx
    ProductMetadata/
      ProductMetadata.tsx
    {Name}/
      {Name}.tsx                 ← no index.ts in a single-file component folder
    index.ts                     ← SINGLE root barrel re-exporting every component
  config/
    merchant/
      merchantConfig.ts          ← active merchant: credentials + theme + features
      merchantTypes.ts
      index.ts
    index.ts
  theme/
    theme.ts                     ← createTheme (Restyle)
    textVariants.ts              ← variants in their own file, not inlined in theme.ts
    palette.ts
    index.ts
  hooks/
  utils/
  types/
  constants/
```

## Naming

| Artifact | File | Export |
|---|---|---|
| UseCase hook | `use{Domain}{Action}{Target}.ts` | `function use{Domain}{Action}{Target}(...)` — `useProductGetList`, never `useGetProductList` |
| Service | `{domain}Service.ts` | `export const {domain}Service = { ... }` |
| Api | `{domain}Api.ts` | `export const {domain}Api = { ... }` |
| Adapter | `{domain}Adapter.ts` | `export const {domain}Adapter = { toProduct, toMetafields }` |
| Queries | `{domain}Queries.ts` | named const documents: `PRODUCT_LIST_QUERY` |
| Types | `{domain}Types.ts` | domain-prefixed: `Product`, `ProductVariant`, `ProductApi` |
| Path alias | `@api`, `@domain`, `@components`, `@screens`, `@routes`, `@theme`, `@config`, `@hooks`, `@infra`, `@utils`, `@constants`, `@types` | → `src/{folder}` |

## Barrel exports

Import from the **module root alias**, never a deep path:

```ts
// ✅
import { useProductGetList, Product } from '@domain';
import { ProductBadge } from '@components';
// ❌
import { useProductGetList } from '@domain/Product/useCases/useProductGetList';
```

Where `index.ts` goes — and where it does NOT:

| Folder | `index.ts`? |
|---|---|
| `src/{module}/` (api, domain, components, screens, infra, config, theme, hooks, utils) | **Yes** — always |
| `domain/{Domain}/` and `domain/{Domain}/useCases/` | **Yes** |
| `components/{Name}/` holding a single `.tsx` | **No** — the root `components/index.ts` re-exports it |
| `screens/{Name}Screen/` | **No** — `screens/index.ts` re-exports `./{Name}Screen/{Name}Screen` |
| `screens/{Name}Screen/components/` | Yes |

### The domain barrel never exports the service (MANDATORY)

`domain/{Domain}/index.ts` exports **useCases + types only**:

```ts
export * from './useCases';
export * from './productTypes';
```

The service, api and adapter stay module-private. That is what makes "a screen may not call the service directly" structurally impossible instead of merely written down. A service reachable from `@domain` is a defect.

## Coverage unit

The atomic unit is **domain + its useCases** and **screen + its components**. There is **no coverage gate** in this repo — no test layer is installed (quick-rule #11). The gate is the simulator: a change is done when the screen was exercised on a running device/emulator, not when a checkbox is green.

## Principle

Screens are thin. Services are pure delegation. **Adapters own all mapping — including every metafield.** UseCase hooks are the only React Query entry point.
