import { Box } from "../Box/Box";
import { Text } from "../Text/Text";

interface ProductBadgeProps {
  text?: string;
}

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
