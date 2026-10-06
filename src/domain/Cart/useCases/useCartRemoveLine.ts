import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ShopifyError } from "@api";
import type { MutationOptions } from "@infra";
import { QueryKeys } from "@infra";

import { getActiveCartId } from "../activeCart";
import { cartService } from "../cartService";
import type { Cart } from "../cartTypes";

export function useCartRemoveLine(options?: MutationOptions<Cart>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (lineId: string) => removeLine(lineId),
    onSuccess: cart => {
      queryClient.setQueryData([QueryKeys.Cart, cart.id], cart);
      options?.onSuccess?.(cart);
    },
    onError: () => {
      options?.onError?.(
        options.errorMessage ?? "Não foi possível remover o item.",
      );
    },
  });

  return {
    removeLine: (lineId: string) => mutate(lineId),
    isPending,
  };
}

async function removeLine(lineId: string): Promise<Cart> {
  const cartId = getActiveCartId();

  if (!cartId) {
    throw new ShopifyError("Não há carrinho aberto.");
  }

  return cartService.removeLine(cartId, lineId);
}
