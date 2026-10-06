import { Image } from "react-native";

import { Box, PressableBox, QuantityStepper, Text } from "@components";
import type { CartLine } from "@domain";
import { formatPrice } from "@utils";

interface CartLineRowProps {
  line: CartLine;
  isBusy: boolean;
  onChangeQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
  onOpenProduct: (handle: string) => void;
}

export function CartLineRow({
  line,
  isBusy,
  onChangeQuantity,
  onRemove,
  onOpenProduct,
}: CartLineRowProps) {
  // Shopify caps a line at the stock it has and reports the capped number back without an error,
  // so without this the plus button would look broken rather than exhausted.
  const isAtStockLimit =
    line.stockLimit !== undefined && line.quantity >= line.stockLimit;

  return (
    <Box flexDirection="row" gap="s12" paddingVertical="s16">
      <PressableBox
        width={THUMB}
        height={THUMB}
        backgroundColor="surface"
        borderRadius="s4"
        overflow="hidden"
        accessibilityRole="button"
        accessibilityLabel={`Open ${line.productTitle}`}
        onPress={() => onOpenProduct(line.productHandle)}
      >
        {line.image ? (
          <Image
            source={{ uri: line.image.url }}
            accessibilityLabel={line.image.altText ?? line.productTitle}
            resizeMode="cover"
            style={FILL}
          />
        ) : null}
      </PressableBox>

      <Box flex={1} gap="s4">
        <Text variant="titleMedium">{line.productTitle}</Text>

        {line.variantTitle === DEFAULT_VARIANT ? null : (
          <Text variant="caption">{line.variantTitle}</Text>
        )}

        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          marginTop="s4"
        >
          {/* Decrementing from one is a removal for Shopify too, so neither side special-cases it. */}
          <QuantityStepper
            quantity={line.quantity}
            min={0}
            max={line.stockLimit}
            disabled={isBusy}
            decreaseLabel={
              line.quantity === 1 ? "Remove item" : "Decrease quantity"
            }
            onChange={quantity => onChangeQuantity(line.id, quantity)}
          />

          <Text variant="body" marginLeft="s12">
            {formatPrice(line.lineTotal)}
          </Text>
        </Box>

        {/* Its own line: beside the stepper it crowded the price. Only at the cap, because an
            untracked variant has no number to show. */}
        {isAtStockLimit ? (
          <Text variant="caption">All {line.stockLimit} in stock</Text>
        ) : null}
      </Box>

      <PressableBox
        accessibilityRole="button"
        accessibilityLabel={`Remove ${line.productTitle}`}
        disabled={isBusy}
        opacity={isBusy ? 0.4 : 1}
        onPress={() => onRemove(line.id)}
      >
        <Text variant="caption" color="textMuted">
          Remove
        </Text>
      </PressableBox>
    </Box>
  );
}

/** Shopify's name for a product that has no real options — never shown as a chosen variant. */
const DEFAULT_VARIANT = "Default Title";
const THUMB = 64;
const FILL = { width: "100%", height: "100%" } as const;
