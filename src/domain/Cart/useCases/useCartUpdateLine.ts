import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ShopifyError } from "@api";
import type { MutationOptions } from "@infra";
import { QueryKeys } from "@infra";

import { getActiveCartId } from "../activeCart";
import { cartService } from "../cartService";
import type { Cart } from "../cartTypes";

/** Quantity zero is a removal for Shopify too, so the stepper never special-cases it. */
export function useCartUpdateLine(options?: MutationOptions<Cart>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: UpdateLineVariables) =>
      updateLine(variables.lineId, variables.quantity),
    onSuccess: cart => {
      queryClient.setQueryData([QueryKeys.Cart, cart.id], cart);
      options?.onSuccess?.(cart);
    },
    onError: () => {
      options?.onError?.(
        options.errorMessage ?? "Não foi possível atualizar o carrinho.",
      );
    },
  });

  return {
    updateLine: (lineId: string, quantity: number) =>
      mutate({ lineId, quantity }),
    isPending,
  };
}

interface UpdateLineVariables {
  lineId: string;
  quantity: number;
}

async function updateLine(lineId: string, quantity: number): Promise<Cart> {
  const cartId = getActiveCartId();

  if (!cartId) {
    throw new ShopifyError("Não há carrinho aberto.");
  }

  return cartService.updateLine(cartId, lineId, quantity);
}
