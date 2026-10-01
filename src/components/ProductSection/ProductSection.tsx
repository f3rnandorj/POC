import { Box } from '../Box/Box';
import { Text } from '../Text/Text';

interface ProductSectionProps {
  title: string;
  items: ProductSectionItem[];
}

interface ProductSectionItem {
  label: string;
  value?: string;
}

/**
 * A titled block of label/value pairs — "How to care" today, "Ingredients" or "Sizing" for
 * the next merchant without an edit. Like `ProductBadge`, it owns its own absence: the
 * heading and the hairline above it never render on their own (quick-rule #5).
 */
export function ProductSection({ title, items }: ProductSectionProps) {
  const filled = items.filter(item => Boolean(item.value));

  if (filled.length === 0) {
    return null;
  }

  return (
    <Box borderTopWidth={1} borderTopColor="border" paddingTop="s16" gap="s12">
      <Text variant="titleMedium">{title}</Text>

      {filled.map(item => (
        <Box key={item.label} gap="s4">
          <Text variant="caption">{item.label}</Text>
          <Text variant="body">{item.value}</Text>
        </Box>
      ))}
    </Box>
  );
}
