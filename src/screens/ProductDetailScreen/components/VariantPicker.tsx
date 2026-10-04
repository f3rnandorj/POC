import { Box, PressableBox, Text } from "@components";
import type { ProductVariant } from "@domain";

interface VariantPickerProps {
  variants: ProductVariant[];
  selectedId?: string;
  onSelect: (variantId: string) => void;
}

export function VariantPicker({
  variants,
  selectedId,
  onSelect,
}: VariantPickerProps) {
  // A single-variant product arrives from Shopify as "Default Title" — not a real choice.
  if (!hasMeaningfulChoice(variants)) {
    return null;
  }

  return (
    <Box borderTopWidth={1} borderTopColor="border" paddingTop="s16" gap="s12">
      <Text variant="titleMedium">Available in</Text>

      <Box flexDirection="row" flexWrap="wrap" gap="s8">
        {variants.map(variant => (
          <VariantChip
            key={variant.id}
            variant={variant}
            isSelected={variant.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </Box>
    </Box>
  );
}

interface VariantChipProps {
  variant: ProductVariant;
  isSelected: boolean;
  onSelect: (variantId: string) => void;
}

function VariantChip({ variant, isSelected, onSelect }: VariantChipProps) {
  const isSoldOut = !variant.isAvailable;

  return (
    <PressableBox
      backgroundColor={isSelected ? "accent" : "surface"}
      borderRadius="s2"
      paddingVertical="s8"
      paddingHorizontal="s16"
      opacity={isSoldOut ? 0.4 : 1}
      disabled={isSoldOut}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: isSoldOut }}
      accessibilityLabel={
        isSoldOut ? `${variant.title}, sold out` : variant.title
      }
      onPress={() => onSelect(variant.id)}
    >
      <Text variant="badge" color={isSelected ? "accentText" : "text"}>
        {variant.title}
      </Text>
      {isSoldOut && (
        <Text variant="caption" color="danger">
          Sold out
        </Text>
      )}
    </PressableBox>
  );
}

function hasMeaningfulChoice(variants: ProductVariant[]): boolean {
  return (
    variants.length > 1 ||
    (variants.length === 1 && variants[0].title !== "Default Title")
  );
}
