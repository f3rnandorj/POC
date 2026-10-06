import { shopifyClient } from "@api";

import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "./cartQueries";
import type {
  CartCreateApi,
  CartLinesAddApi,
  CartLinesRemoveApi,
  CartLinesUpdateApi,
  CartQueryApi,
} from "./cartTypes";

async function get(cartId: string): Promise<CartQueryApi> {
  return shopifyClient.request<CartQueryApi>(CART_QUERY, { id: cartId });
}

async function create(
  variantId: string,
  quantity: number,
): Promise<CartCreateApi> {
  return shopifyClient.request<CartCreateApi>(CART_CREATE_MUTATION, {
    lines: [toLineInput(variantId, quantity)],
  });
}

async function linesAdd(
  cartId: string,
  variantId: string,
  quantity: number,
): Promise<CartLinesAddApi> {
  return shopifyClient.request<CartLinesAddApi>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [toLineInput(variantId, quantity)],
  });
}

async function linesUpdate(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<CartLinesUpdateApi> {
  return shopifyClient.request<CartLinesUpdateApi>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
}

async function linesRemove(
  cartId: string,
  lineId: string,
): Promise<CartLinesRemoveApi> {
  return shopifyClient.request<CartLinesRemoveApi>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });
}

/** `merchandiseId` is Shopify's word for a variant id, and it stops at this file. */
function toLineInput(variantId: string, quantity: number) {
  return { merchandiseId: variantId, quantity };
}

export const cartApi = {
  get,
  create,
  linesAdd,
  linesUpdate,
  linesRemove,
};
