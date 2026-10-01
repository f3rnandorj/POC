export const BRAND_STORY_QUERY = /* GraphQL */ `
  query BrandStory($type: String!) {
    metaobjects(type: $type, first: 1) {
      edges {
        node {
          id
          handle
          fields {
            key
            value
            reference {
              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;
