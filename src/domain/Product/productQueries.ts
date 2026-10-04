import { PRODUCT_CARD_FRAGMENT, PRODUCT_CORE_FRAGMENT } from "@api";

export const PRODUCT_LIST_QUERY = /* GraphQL */ `
  query ProductList($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductCore
      description
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            image {
              url
              altText
            }
          }
        }
      }
    }
  }
  ${PRODUCT_CORE_FRAGMENT}
`;
