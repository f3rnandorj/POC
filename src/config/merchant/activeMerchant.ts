import { useSyncExternalStore } from "react";

import type { MerchantId } from "./merchantTypes";

/**
 * Mutable at runtime for the demo switch, so nothing derived from the merchant may be captured
 * in a module constant — read it through `merchantConfig()` on every use.
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

export function useActiveMerchantId(): MerchantId {
  return useSyncExternalStore(subscribe, getActiveMerchantId);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
