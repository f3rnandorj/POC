import { Box } from '../Box/Box';
import { Text } from '../Text/Text';

interface ProductMetadataProps {
  material?: string;
  promotion?: string;
}

/**
 * Merchant copy that is text and nothing else. No label prefix on purpose — a `Material:`
 * label would read as `Material: undefined` the moment the metafield goes away, and the
 * values already read as sentences ("Organic Cotton", "Free shipping above $199").
 */
export function ProductMetadata({ material, promotion }: ProductMetadataProps) {
  if (!material && !promotion) {
    return null;
  }

  return (
    <Box gap="s4">
      {material ? (
        <Text variant="body" color="textMuted">
          {material}
        </Text>
      ) : null}

      {promotion ? (
        <Text variant="body" color="textMuted">
          {promotion}
        </Text>
      ) : null}
    </Box>
  );
}
