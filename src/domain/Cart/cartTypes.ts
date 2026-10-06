import type { EdgesApi, ImageApi, MoneyV2Api } from "@api";

import type { ProductImage, ProductPrice } from "../Product/productTypes";

export interface Cart {
  id: string;
  /** Shopify's own web checkout for this cart — the only way out of the app's buying flow. */
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: ProductPrice;
  lines: CartLine[];
}

export interface CartLine {
  id: string;
  quantity: number;
  variantId: string;
  productTitle: string;
  /** What the detail screen navigates by — ids over objects, handles over ids for products. */
  productHandle: string;
  variantTitle: string;
  image?: ProductImage;
  lineTotal: ProductPrice;
  /**
   * How many Shopify will sell, when the merchant tracks this variant's inventory. Absent means
   * untracked — `quantityAvailable` is `0` both for "none left" and for "not counted", and a
   * variant that is sellable with zero counted is the second case.
   */
  stockLimit?: number;
}

export interface CartNodeApi {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: MoneyV2Api };
  lines: EdgesApi<CartLineNodeApi>;
}

export interface CartLineNodeApi {
  id: string;
  quantity: number;
  cost: { totalAmount: MoneyV2Api };
  /** `merchandise` is a union; the query selects only its `ProductVariant` member. */
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    image: ImageApi | null;
    product: { title: string; handle: string };
  };
}

export interface CartQueryApi {
  /** Shopify drops a cart it no longer knows, and answers `null` rather than an error. */
  cart: CartNodeApi | null;
}

export interface CartPayloadApi {
  cart: CartNodeApi | null;
  userErrors: CartUserErrorApi[];
}

export interface CartUserErrorApi {
  field: string[] | null;
  message: string;
}

export interface CartCreateApi {
  cartCreate: CartPayloadApi;
}

export interface CartLinesAddApi {
  cartLinesAdd: CartPayloadApi;
}

export interface CartLinesUpdateApi {
  cartLinesUpdate: CartPayloadApi;
}

export interface CartLinesRemoveApi {
  cartLinesRemove: CartPayloadApi;
}
