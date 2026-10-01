/** Raw Storefront shapes shared across domains. Domain-specific ones live in `{domain}Types.ts`. */

export interface MoneyV2Api {
  amount: string;
  currencyCode: string;
}

export interface ImageApi {
  url: string;
  altText: string | null;
}

export interface EdgesApi<TNode> {
  edges: { node: TNode }[];
}

/**
 * A metafield the product does not define comes back as `null`, and the array is
 * positional — so the whole array is `(MetafieldApi | null)[]`, never `MetafieldApi[]`.
 * This type is the reason the adapter indexes by `key` (standards/shopify.md).
 */
export interface MetafieldApi {
  key: string;
  value: string;
  type: string;
}

export interface GraphQLErrorApi {
  message: string;
}

export interface GraphQLResponseApi<TData> {
  data?: TData;
  errors?: GraphQLErrorApi[];
}
