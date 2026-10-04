import { useSyncExternalStore } from "react";

import type { MerchantId } from "./merchantTypes";

/**
 * Which merchant the app is talking to, mutable at runtime.
 *
 * A real build is bound to one merchant: the store is a POC affordance so a reviewer holding the
 * APK can see the same code draw a different store (see `MerchantSwitch`). Because of it, nothing
 * derived from the merchant may be captured in a module constant — read it through
 * `merchantConfig()` on every use.
 */
let activeMerchantId: MerchantId = "northstar";

const listeners = new Set<() => void>();

export function getActiveMerchantId(): MerchantId {
  return activeMerchantId;
}

export function setActiveMerchant(merchantId: MerchantId): void {
  if (merchantId === activeMerchantId) {
    return;
  }

  activeMerchantId = merchantId;
  listeners.forEach(listener => listener());
}

/** Read by the app root, which rebuilds the theme and remounts the tree on a change. */
export function useActiveMerchantId(): MerchantId {
  return useSyncExternalStore(subscribe, getActiveMerchantId);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
