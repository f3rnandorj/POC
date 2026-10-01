import { Image } from 'react-native';

import type { Product } from '@domain';
import { formatPrice } from '@utils';

import { Box } from '../Box/Box';
import { PressableBox } from '../PressableBox/PressableBox';
import { Text } from '../Text/Text';

interface ProductCardProps {
  product: Product;
  onPress: (handle: string) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const [image] = product.images;

  return (
    <PressableBox flex={1} gap="s8" onPress={() => onPress(product.handle)}>
      {/* `surface` behind the image keeps the grid from jumping while it loads. */}
      <Box
        backgroundColor="surface"
        borderRadius="s4"
        overflow="hidden"
        aspectRatio={1}
        width="100%"
      >
        {image && (
          <Image
            source={{ uri: image.url }}
            accessibilityLabel={image.altText ?? product.title}
            resizeMode="cover"
            style={FILL}
          />
        )}
      </Box>

      <Text variant="caption" color="text" numberOfLines={2}>
        {product.title}
      </Text>
      <Text variant="caption" color="textMuted">
        {formatPrice(product.price)}
      </Text>
    </PressableBox>
  );
}

const FILL = { width: '100%', height: '100%' } as const;
