import type {
  Cart,
  CartLine,
  CartLineNodeApi,
  CartNodeApi,
  CartQueryApi,
} from "./cartTypes";

function toCart(node: CartNodeApi): Cart {
  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    subtotal: node.cost.subtotalAmount,
    lines: node.lines.edges.map(edge => toCartLine(edge.node)),
  };
}

/** A cart Shopify has dropped comes back as `cart: null`, not as an error. */
function toCartDetail(response: CartQueryApi): Cart | undefined {
  return response.cart ? toCart(response.cart) : undefined;
}

function toCartLine(node: CartLineNodeApi): CartLine {
  const { merchandise } = node;

  return {
    id: node.id,
    quantity: node.quantity,
    variantId: merchandise.id,
    productTitle: merchandise.product.title,
    productHandle: merchandise.product.handle,
    variantTitle: merchandise.title,
    image: merchandise.image
      ? {
          url: merchandise.image.url,
          altText: merchandise.image.altText ?? undefined,
        }
      : undefined,
    lineTotal: node.cost.totalAmount,
    stockLimit: toStockLimit(merchandise.quantityAvailable),
  };
}

/** Zero means "not counted" as often as it means "none left", so only a positive count is a cap. */
function toStockLimit(quantityAvailable: number | null): number | undefined {
  return quantityAvailable && quantityAvailable > 0
    ? quantityAvailable
    : undefined;
}

export const cartAdapter = {
  toCart,
  toCartDetail,
};
