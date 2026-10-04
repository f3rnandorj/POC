// Reaches past the Product barrel on purpose (quick-rule #10): nested products must come out
// of the same mapper the grid uses, and the barrel exports useCases + types only.
import { productAdapter } from "../Product/productAdapter";

import type {
  Collection,
  CollectionListApi,
  CollectionNodeApi,
  CollectionProducts,
  CollectionProductsApi,
} from "./collectionTypes";

function toCollection(node: CollectionNodeApi): Collection {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    image: node.image
      ? { url: node.image.url, altText: node.image.altText ?? undefined }
      : undefined,
  };
}

function toCollectionList(response: CollectionListApi): Collection[] {
  return response.collections.edges.map(edge => toCollection(edge.node));
}

/** An unpublished or unknown handle comes back as `collection: null`, not as an error. */
function toCollectionProducts(
  response: CollectionProductsApi,
): CollectionProducts | undefined {
  if (!response.collection) {
    return undefined;
  }

  return {
    collection: toCollection(response.collection),
    products: response.collection.products.edges.map(edge =>
      productAdapter.toProduct(edge.node),
    ),
  };
}

export const collectionAdapter = {
  toCollection,
  toCollectionList,
  toCollectionProducts,
};
