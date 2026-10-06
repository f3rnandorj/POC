import { useEffect, useState } from "react";

import { Box, Button, QuantityStepper, Text } from "@components";
import type { Cart, ProductVariant } from "@domain";
import { useCartAddLine, useCartGetDetail } from "@domain";

interface AddToCartFooterProps {
  /** Absent when every variant is sold out — the CTA stays visible but cannot be pressed. */
  variant?: ProductVariant;
}

export function AddToCartFooter({ variant }: AddToCartFooterProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState<Note>();
  const { cart } = useCartGetDetail();

  // What is already in the cart is already off the shelf, so the ceiling here is what is left of
  // the variant's stock after it. Shopify caps silently; without this the CTA would promise an
  // add it cannot make.
  const inCart = quantityInCart(cart, variant?.id);
  const remaining =
    variant?.stockLimit === undefined
      ? undefined
      : Math.max(0, variant.stockLimit - inCart);
  const isExhausted = remaining === 0;

  const { addLine, isPending } = useCartAddLine({
    onSuccess: updated => {
      setNote(toNote(quantityInCart(updated, variant?.id) - inCart, quantity));
      // Back to one: the next add is a new decision, not a repeat of this one.
      setQuantity(1);
    },
    onError: message => setNote({ text: message, tone: "danger" }),
  });

  // Picking another variant resets the count — its stock, and its ceiling, are not this one's.
  useEffect(() => setQuantity(1), [variant?.id]);

  // The note is a confirmation, not a state: it says what landed and then gets out of the way.
  useEffect(() => {
    if (!note) {
      return;
    }

    const timeout = setTimeout(() => setNote(undefined), NOTE_DURATION);

    return () => clearTimeout(timeout);
  }, [note]);

  return (
    <>
      {note ? (
        <Text variant="caption" color={note.tone}>
          {note.text}
        </Text>
      ) : isExhausted ? (
        <Text variant="caption">
          All {variant?.stockLimit} in stock are in your cart
        </Text>
      ) : null}

      <Box flexDirection="row" alignItems="center" gap="s16">
        <QuantityStepper
          quantity={quantity}
          max={remaining}
          disabled={!variant || isPending || isExhausted}
          onChange={setQuantity}
        />

        <Button
          label={isPending ? "Adding" : "Add to cart"}
          disabled={!variant || isPending || isExhausted}
          accessibilityLabel={
            variant && !isExhausted
              ? `Add ${quantity} to cart`
              : "Add to cart, unavailable"
          }
          onPress={() => addLine(String(variant?.id), quantity)}
        />
      </Box>
    </>
  );
}

interface Note {
  text: string;
  tone: "success" | "danger";
}

function quantityInCart(cart: Cart | undefined, variantId?: string): number {
  if (!variantId) {
    return 0;
  }

  return cart?.lines.find(line => line.variantId === variantId)?.quantity ?? 0;
}

/**
 * The cart that comes back is the only honest account of what happened: Shopify trims a line to
 * the stock it has and reports no error, so "added" is the difference, not the request.
 */
function toNote(added: number, requested: number): Note {
  if (added <= 0) {
    return { text: "Nothing added — no more in stock", tone: "danger" };
  }

  if (added < requested) {
    return { text: `Added ${added} — that is all the stock`, tone: "success" };
  }

  return { text: "Added to cart", tone: "success" };
}

const NOTE_DURATION = 3000;
