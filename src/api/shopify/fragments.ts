import { merchantConfig } from '@config';

export const PRODUCT_METAFIELDS_FRAGMENT = /* GraphQL */ `
  fragment ProductMetafields on Product {
    metafields(identifiers: [${buildMetafieldIdentifiers()}]) {
      key
      value
      type
    }
  }
`;

/**
 * Everything both the grid and the detail need, minus `images` — the two screens want
 * different page sizes, and GraphQL rejects a document where one field carries two sets
 * of arguments ("Field 'images' has an argument conflict"). Each query selects its own.
 */
export const PRODUCT_CORE_FRAGMENT = /* GraphQL */ `
  fragment ProductCore on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    ...ProductMetafields
  }
  ${PRODUCT_METAFIELDS_FRAGMENT}
`;

export const PRODUCT_CARD_FRAGMENT = /* GraphQL */ `
  fragment ProductCard on Product {
    ...ProductCore
    images(first: 1) {
      edges {
        node {
          url
          altText
        }
      }
    }
  }
  ${PRODUCT_CORE_FRAGMENT}
`;

/**
 * Rendered from `merchantConfig` rather than hardcoded, so a merchant whose keys differ
 * is a config change and not a query edit (standards/shopify.md, rule 4).
 */
function buildMetafieldIdentifiers(): string {
  // `flatMap` rather than `map`: a concept the merchant omits is simply never requested, and
  // an explicit `undefined` in the map must not become `{ namespace: "undefined" }`.
  return Object.values(merchantConfig.metafields)
    .flatMap(identifier =>
      identifier ? [`{ namespace: "${identifier.namespace}", key: "${identifier.key}" }`] : []
    )
    .join(' ');
}
