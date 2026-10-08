import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "@infra";

import { clearActiveCart, useActiveCartId } from "../activeCart";
import { cartService } from "../cartService";

export function useCartGetDetail() {
  const cartId = useActiveCartId();

  // React Query v5 rejects `undefined` as cached data, so a dropped cart crosses it as `null`.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKeys.Cart, cartId],
    queryFn: async () => (await cartService.get(String(cartId))) ?? null,
    enabled: Boolean(cartId),
  });

  // Forgetting the id is what makes the next add start a new cart instead of failing.
  useEffect(() => {
    if (cartId && data === null) {
      clearActiveCart();
    }
  }, [cartId, data]);

  return {
    cart: data ?? undefined,
    isLoading,
    error,
    refetch,
  };
}
