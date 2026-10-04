import type { EdgesApi, ImageApi, MetafieldApi, MoneyV2Api } from "@api";
import type { ProductDetailArea } from "@config";

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: ProductPrice;
  images: ProductImage[];
  variants: ProductVariant[];
  content: ProductContent;
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
}

/** Resolved blocks grouped by the detail area they render into; an empty area is absent. */
export type ProductContent = Partial<
  Record<ProductDetailArea, ResolvedBlock[]>
>;

export type ResolvedBlock =
  | ResolvedBadge
  | ResolvedTextLine
  | ResolvedLabelValueSection;

export interface ResolvedBadge {
  id: string;
  kind: "badge";
  text: string;
}

export interface ResolvedTextLine {
  id: string;
  kind: "textLine";
  text: string;
}

export interface ResolvedLabelValueSection {
  id: string;
  kind: "labelValueSection";
  title: string;
  items: ResolvedItem[];
}

export interface ResolvedItem {
  label: string;
  value: string;
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
  image?: ImageApi | null;
}

export interface ProductListApi {
  products: EdgesApi<ProductNodeApi>;
}

export interface ProductByHandleApi {
  product: ProductNodeApi | null;
}
