import { useSyncExternalStore } from "react";

import { createMMKV } from "react-native-mmkv";

import { getActiveMerchantId } from "@config";

/**
 * The id is a capability token for that one cart, not a store credential, which is why it may
 * sit on disk while the Storefront token may not. Keyed by merchant so a switch swaps carts.
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
