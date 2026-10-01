import { Image } from 'react-native';

import type { Collection } from '@domain';

import { Box } from '../Box/Box';
import { PressableBox } from '../PressableBox/PressableBox';
import { Text } from '../Text/Text';

interface CollectionCardProps {
  collection: Collection;
  onPress: (handle: string) => void;
}

/**
 * A wide banner row. The image is optional — a collection with none keeps the `surface`
 * block, so the row height never depends on whether the merchant uploaded artwork.
 */
export function CollectionCard({ collection, onPress }: CollectionCardProps) {
  const { image } = collection;

  return (
    <PressableBox
      flexDirection="row"
      alignItems="center"
      gap="s12"
      accessibilityRole="button"
      accessibilityLabel={collection.title}
      onPress={() => onPress(collection.handle)}
    >
      <Box backgroundColor="surface" borderRadius="s4" overflow="hidden" width={72} height={72}>
        {image && (
          <Image
            source={{ uri: image.url }}
            accessibilityLabel={image.altText ?? collection.title}
            resizeMode="cover"
            style={FILL}
          />
        )}
      </Box>

      <Text variant="titleMedium" numberOfLines={2} style={FLEXIBLE}>
        {collection.title}
      </Text>
    </PressableBox>
  );
}

const FILL = { width: '100%', height: '100%' } as const;
const FLEXIBLE = { flex: 1 } as const;
