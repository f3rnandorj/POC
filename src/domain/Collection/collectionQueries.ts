import { PRODUCT_CARD_FRAGMENT } from '@api';

export const COLLECTION_LIST_QUERY = /* GraphQL */ `
  query CollectionList($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

/**
 * Reuses the grid's product fragment, so a field added for the list screen reaches the
 * scoped list with no second edit (standards/shopify.md, query conventions).
 */
export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  query CollectionProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      handle
      title
      image {
        url
        altText
      }
      products(first: $first) {
        edges {
          node {
            ...ProductCard
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;
