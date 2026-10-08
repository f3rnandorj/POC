import type { EdgesApi, ImageApi, MetafieldApi, MoneyV2Api } from "@api";

import type { ResolvedBlock } from "../contentTypes";

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: ProductPrice;
  images: ProductImage[];
  variants: ProductVariant[];
  /**
   * The blocks this product resolved from its own metafields, flat and keyed by the block that
   * declared each one. Which area they land in is not the product's to say: a story in the same
   * area comes from a metaobject, so `toAreaContent` groups both at the screen's door.
   */
  blocks: ResolvedBlock[];
}

/** Unformatted on purpose — `formatPrice` runs at render, not in the adapter. */
export interface ProductPrice {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText?: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  isAvailable: boolean;
  image?: ProductImage;
  /** Absent when the merchant does not track this variant — see `CartLine.stockLimit`. */
  stockLimit?: number;
}

export interface ProductNodeApi {
  id: string;
  handle: string;
  title: string;
  description?: string;
  priceRange: { minVariantPrice: MoneyV2Api };
  images: EdgesApi<ImageApi>;
  variants?: EdgesApi<ProductVariantNodeApi>;
  /** Absent when the merchant declared no metafield-backed block — see `fragments.ts`. */
  metafields?: (MetafieldApi | null)[] | null;
}

export interface ProductVariantNodeApi {
  id: string;
  title: string;
  availableForSale: boolean;
  /** Absent on the card fragment, which does not ask for inventory. */
  quantityAvailable?: number | null;
  image?: ImageApi | null;
}

export interface ProductListApi {
  products: EdgesApi<ProductNodeApi>;
}

export interface ProductByHandleApi {
  product: ProductNodeApi | null;
}
