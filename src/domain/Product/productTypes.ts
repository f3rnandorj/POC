import type { EdgesApi, ImageApi, MetafieldApi, MoneyV2Api } from '@api';

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: ProductPrice;
  images: ProductImage[];
  variants: ProductVariant[];
  metafields: ProductMetafields;
}

/** Unformatted on purpose — formatting happens at render, not in the adapter. */
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
  /** Only variants the merchant gave their own photo carry one. */
  image?: ProductImage;
}

/**
 * Every field optional, and absent means `undefined` — never `''`, `'—'` or `null`.
 * The component returns `null` on a missing value (quick-rule #5).
 */
export interface ProductMetafields {
  badge?: string;
  material?: string;
  promotionText?: string;
  isWinterCollection?: boolean;
  careInstructions?: ProductCareInstructions;
}

/** Merchant-authored JSON. Both keys optional — the merchant may fill only one. */
export interface ProductCareInstructions {
  washing?: string;
  drying?: string;
}

// ── raw Storefront shapes ────────────────────────────────────────────────────

export interface ProductNodeApi {
  id: string;
  handle: string;
  title: string;
  description?: string;
  priceRange: { minVariantPrice: MoneyV2Api };
  images: EdgesApi<ImageApi>;
  variants?: EdgesApi<ProductVariantNodeApi>;
  metafields: (MetafieldApi | null)[] | null;
}

export interface ProductVariantNodeApi {
  id: string;
  title: string;
  availableForSale: boolean;
  image?: ImageApi | null;
}

export interface ProductListApi {
  products: EdgesApi<ProductNodeApi>;
}

export interface ProductByHandleApi {
  product: ProductNodeApi | null;
}
