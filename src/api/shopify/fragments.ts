import { queriedMetafieldBlocks } from "@config";

export const PRODUCT_METAFIELDS_FRAGMENT = /* GraphQL */ `
  fragment ProductMetafields on Product {
    ${buildMetafieldSelection()}
  }
`;

/**
 * `images` is excluded: the two screens want different page sizes, and GraphQL rejects a
 * document where one field carries two argument sets ("Field 'images' has an argument conflict").
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

/** Shopify requires 1..250 identifiers and a fragment needs a selection, so `id` stands in. */
function buildMetafieldSelection(): string {
  const identifiers = buildMetafieldIdentifiers();

  if (!identifiers) {
    return "id";
  }

  return `metafields(identifiers: [${identifiers}]) { namespace key value type }`;
}

function buildMetafieldIdentifiers(): string {
  // Two blocks may read one metafield, and a repeat counts against Shopify's 250 limit.
  const identifiers = new Set(
    queriedMetafieldBlocks.map(
      block =>
        `{ namespace: "${block.source.namespace}", key: "${block.source.key}" }`,
    ),
  );

  return [...identifiers].join(" ");
}
