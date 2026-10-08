import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { MutationOptions } from "@infra";
import { QueryKeys } from "@infra";

import { getActiveCartId, setActiveCartId } from "../activeCart";
import { cartService } from "../cartService";
import type { Cart } from "../cartTypes";

export function useCartAddLine(options?: MutationOptions<Cart>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: AddLineVariables) =>
      addLine(variables.variantId, variables.quantity ?? 1),
    onSuccess: cart => {
      setActiveCartId(cart.id);
      queryClient.setQueryData([QueryKeys.Cart, cart.id], cart);
      options?.onSuccess?.(cart);
    },
    onError: () => {
      options?.onError?.(
        options.errorMessage ?? "Não foi possível adicionar ao carrinho.",
      );
    },
  });

  return {
    addLine: (variantId: string, quantity?: number) =>
      mutate({ variantId, quantity }),
    isPending,
  };
}

interface AddLineVariables {
  variantId: string;
  quantity?: number;
}

/** A stored id may point at a cart Shopify dropped, which only shows up when the add fails. */
async function addLine(variantId: string, quantity: number): Promise<Cart> {
  const cartId = getActiveCartId();

  if (!cartId) {
    return cartService.create(variantId, quantity);
  }

  try {
    return await cartService.addLine(cartId, variantId, quantity);
  } catch {
    return cartService.create(variantId, quantity);
  }
}
