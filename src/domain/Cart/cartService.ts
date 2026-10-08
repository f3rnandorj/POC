import { ShopifyError } from "@api";

import { cartAdapter } from "./cartAdapter";
import { cartApi } from "./cartApi";
import type { Cart, CartPayloadApi } from "./cartTypes";

async function get(cartId: string): Promise<Cart | undefined> {
  const response = await cartApi.get(cartId);

  return cartAdapter.toCartDetail(response);
}

async function create(variantId: string, quantity = 1): Promise<Cart> {
  const { cartCreate } = await cartApi.create(variantId, quantity);

  return toCart(cartCreate);
}

async function addLine(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<Cart> {
  const { cartLinesAdd } = await cartApi.linesAdd(cartId, variantId, quantity);

  return toCart(cartLinesAdd);
}

async function updateLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const { cartLinesUpdate } = await cartApi.linesUpdate(
    cartId,
    lineId,
    quantity,
  );

  return toCart(cartLinesUpdate);
}

async function removeLine(cartId: string, lineId: string): Promise<Cart> {
  const { cartLinesRemove } = await cartApi.linesRemove(cartId, lineId);

  return toCart(cartLinesRemove);
}

/**
 * A cart mutation reports a rejected line in `userErrors` with HTTP 200 and no top-level
 * `errors`, so the payload is the only place a sold-out variant or a dead cart shows up.
 */
function toCart(payload: CartPayloadApi): Cart {
  const [userError] = payload.userErrors;

  if (userError) {
    throw new ShopifyError(
      "Não foi possível atualizar o carrinho.",
      userError.message,
    );
  }

  if (!payload.cart) {
    throw new ShopifyError("A loja respondeu sem o carrinho.");
  }

  return cartAdapter.toCart(payload.cart);
}

export const cartService = {
  get,
  create,
  addLine,
  updateLine,
  removeLine,
};
