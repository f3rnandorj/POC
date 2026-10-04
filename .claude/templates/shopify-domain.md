# Template — new Shopify-backed domain

Scaffold for `src/domain/{Domain}/`. Copy the shape, replace `Product`/`product`. Every file order follows `standards/code-style.md`: main export first, helpers below.

## Folder

```
src/domain/{Domain}/
  {domain}Queries.ts
  {domain}Api.ts
  {domain}Service.ts
  {domain}Adapter.ts
  {domain}Types.ts
  useCases/
    use{Domain}{Action}{Target}.ts
    index.ts
  index.ts
```

## `{domain}Queries.ts`

```ts
import { PRODUCT_METAFIELDS_FRAGMENT } from '@api';

export const PRODUCT_LIST_QUERY = /* GraphQL */ `
  query ProductList($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 1) { edges { node { url altText } } }
          ...ProductMetafields
        }
      }
    }
  }
  ${PRODUCT_METAFIELDS_FRAGMENT}
`;
```

No query string outside this file.

## `{domain}Types.ts`

Domain model first, raw Storefront types (`*Api`) below.

```ts
export type Product = {
  id: string;
  title: string;
  description: string;
  price: { amount: string; currencyCode: string };
  images: string[];
  variants: ProductVariant[];
  content: ProductContent;
};

export type ProductVariant = {
  id: string;
  title: string;
  available: boolean;
};

// The merchant's declared blocks, resolved and grouped by area — never a record of named concepts.
// An area that collected nothing is absent, not `[]`. See shopify.md, "Metafields — the contract".
export type ProductContent = Partial<Record<ProductDetailArea, ResolvedBlock[]>>;

// ── raw Storefront shapes ──
export type ProductApi = { /* edges/nodes as Shopify returns them */ };
```

## `{domain}Api.ts` — raw calls only, zero transformation

Functions first, singleton object **closing the file**.

```ts
async function list(first: number): Promise<ProductListApi> {
  return shopifyClient.request<ProductListApi>(PRODUCT_LIST_QUERY, { first });
}

async function byHandle(handle: string): Promise<ProductByHandleApi> {
  return shopifyClient.request<ProductByHandleApi>(PRODUCT_BY_HANDLE_QUERY, { handle });
}

export const productApi = {
  list,
  byHandle,
};
```

## `{domain}Adapter.ts` — all mapping, pure functions

```ts
function toProduct(node: ProductNodeApi): Product { /* ... */ }

function toProductList(response: ProductListApi): Product[] {
  return response.products.edges.map(edge => toProduct(edge.node));
}

function toContent(raw: (MetafieldApi | null)[] | undefined): ProductContent { /* walks productDetailAreas */ }

export const productAdapter = {
  toProduct,
  toProductList,
  toContent,
};
```

The adapter is the only place that knows the words `edges` and `node`, and the only place that parses a metafield value or resolves a merchant block.

## `{domain}Service.ts` — transform + delegate, no React

```ts
async function list(first = 20): Promise<Product[]> {
  const response = await productApi.list(first);

  return productAdapter.toProductList(response);
}

async function byHandle(handle: string): Promise<Product | undefined> {
  const response = await productApi.byHandle(handle);

  return response.product ? productAdapter.toProduct(response.product) : undefined;
}

export const productService = {
  list,
  byHandle,
};
```

## `useCases/use{Domain}{Action}{Target}.ts` — the only React Query entry point

Domain first, verb after: `useProductGetList`, `useProductGetDetail`.

```ts
export function useProductGetList() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.ProductList],
    queryFn: () => productService.list(),
  });

  return { products: data ?? [], isLoading, error, refetch };
}
```

Query key from the `QueryKeys` enum. Returns a UI-ready shape, never the raw React Query object.

## Barrels

`useCases/index.ts` re-exports every hook. `{Domain}/index.ts` re-exports **useCases + types only**:

```ts
// domain/Product/index.ts
export * from './useCases';
export * from './productTypes';
```

The service, api and adapter are module-private — a screen that can import `productService` from `@domain` can skip the useCase layer, so the barrel simply does not expose it. `src/domain/index.ts` re-exports every domain; consumers import from `@domain`.

## Checklist

- [ ] No GraphQL string outside `{domain}Queries.ts`
- [ ] No `edges`/`node` above the adapter
- [ ] No metafield parsing and no block resolution outside the adapter
- [ ] Service has no React import
- [ ] Hook is the only `useQuery` caller
- [ ] `index.ts` in the domain folder and in `useCases/` — and the domain barrel does NOT export the service
- [ ] Singleton object (`productService`/`productApi`/`productAdapter`) declared LAST in its file
- [ ] Hooks named `use{Domain}{Action}{Target}`
