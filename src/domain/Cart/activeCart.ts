import { useSyncExternalStore } from "react";

import { createMMKV } from "react-native-mmkv";

import { getActiveMerchantId } from "@config";

/**
 * Which cart the app is holding, per merchant, surviving a restart.
 *
 * The id is a capability token for that one cart — not a store credential — which is why it may
 * sit on disk while the Storefront token may not. Nothing else is stored: the lines, the prices
 * and the totals always come back from Shopify.
 *
 * The key carries the merchant id, so the demo switch swaps carts instead of leaking one store's
 * cart into the other, and neither has to be cleared.
 */
const storage = createMMKV({ id: "cart" });

const listeners = new Set<() => void>();

export function getActiveCartId(): string | undefined {
  return storage.getString(cartKey());
}

export function setActiveCartId(cartId: string): void {
  if (cartId === getActiveCartId()) {
    return;
  }

  storage.set(cartKey(), cartId);
  listeners.forEach(listener => listener());
}

/** Called when the cart is checked out or Shopify has dropped it. */
export function clearActiveCart(): void {
  if (getActiveCartId() === undefined) {
    return;
  }

  storage.remove(cartKey());
  listeners.forEach(listener => listener());
}

export function useActiveCartId(): string | undefined {
  return useSyncExternalStore(subscribe, getActiveCartId);
}

function cartKey(): string {
  return `cart:${getActiveMerchantId()}`;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
