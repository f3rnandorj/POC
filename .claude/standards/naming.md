# Naming

## Files

| Artifact | Pattern | Example |
|---|---|---|
| Component | `PascalCase.tsx` in a `PascalCase/` folder, **no local `index.ts`** | `components/ProductBadge/ProductBadge.tsx` |
| Screen | `{Name}Screen.tsx` in `screens/{Name}Screen/` — suffix mandatory | `screens/ProductDetailScreen/ProductDetailScreen.tsx` |
| Domain folder | `PascalCase` | `domain/Product/` |
| Api / Service / Adapter / Types / Queries | `{domain}{Role}.ts`, camelCase prefix | `productAdapter.ts` |
| UseCase hook | `use{Domain}{Action}{Target}.ts` — domain first | `useProductGetDetail.ts` |
| Util | `{name}Utils.ts` (multi-export) or `{name}.ts` (single) | `priceUtils.ts` |
| Config | camelCase | `merchantConfig.ts` |
| Barrel | `index.ts` | — |

No `kebab-case` files. No `.styles.ts` files — styling is Restyle props.

## Symbols

| Kind | Convention |
|---|---|
| UseCase hook | `use{Domain}{Action}{Target}` — `useProductGetList`, `useProductGetDetail`. Never verb-first (`useGetProductList`). File name === function name |
| Component | `PascalCase` |
| Hook | `useCamelCase` |
| Service / api / adapter object | `camelCase` singleton const |
| Type / interface | `PascalCase`, domain-prefixed; raw Storefront type gets the `Api` suffix |
| GraphQL document const | `SCREAMING_SNAKE_CASE` ending in `_QUERY` |
| Enum | `PascalCase` name, `PascalCase` members (`QueryKeys.ProductList`) |
| Theme token | camelCase semantic name (`textMuted`), never a color name (`gray400`) |
| Boolean | `is` / `has` / `can` prefix (`isWinterCollection`) |

## Adapter function names

Bare, no domain prefix — the object already carries it: `productAdapter.toProduct`, `productAdapter.toMetafields`. Never `productAdapter.toProductProduct`.

## Merchant names

A merchant name (`northstar`, `Northstar`) may appear **only** inside `src/config/merchant/`. Anywhere else — a file name, a component, a type, a token, a comment describing behavior — it is a defect. See `shopify.md`.
