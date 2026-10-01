import { Box } from '../Box/Box';
import { Text } from '../Text/Text';

interface ProductBadgeProps {
  text?: string;
}

/**
 * The identity primitive (standards/design.md). One treatment, driven only by `text`.
 * Owns its own absence: returning `null` means the parent's `gap` leaves no hole behind
 * it, which is what makes every "hide the section when empty" requirement a one-liner.
 */
export function ProductBadge({ text }: ProductBadgeProps) {
  if (!text) {
    return null;
  }

  return (
    <Box
      backgroundColor="accent"
      borderRadius="s2"
      paddingVertical="s4"
      paddingHorizontal="s8"
      alignSelf="flex-start"
    >
      <Text variant="badge" color="accentText">
        {text}
      </Text>
    </Box>
  );
}
