import type { EdgesApi, ImageApi } from '@api';

import type { Product, ProductNodeApi } from '../Product/productTypes';

export interface Collection {
  id: string;
  handle: string;
  title: string;
  image?: CollectionImage;
}

export interface CollectionImage {
  url: string;
  altText?: string;
}

/** What a scoped list screen needs: the collection's own title plus its products. */
export interface CollectionProducts {
  collection: Collection;
  products: Product[];
}

// ── raw Storefront shapes ────────────────────────────────────────────────────

export interface CollectionNodeApi {
  id: string;
  handle: string;
  title: string;
  image: ImageApi | null;
}

export interface CollectionListApi {
  collections: EdgesApi<CollectionNodeApi>;
}

export interface CollectionProductsApi {
  collection: (CollectionNodeApi & { products: EdgesApi<ProductNodeApi> }) | null;
}
