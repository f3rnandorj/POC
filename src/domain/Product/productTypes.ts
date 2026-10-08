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
  /** Flat, not grouped: which area each lands in is `toAreaContent`'s call, not the product's. */
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
