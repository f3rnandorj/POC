import { FlatList } from 'react-native';

import { Box, PressableBox, ProductCard, Text } from '@components';
import type { Product } from '@domain';

import { SectionNote } from './SectionNote';

interface HomeHeaderProps {
  products: Product[];
  isLoading: boolean;
  error: unknown;
  onOpenProduct: (handle: string) => void;
  onOpenAll: () => void;
}

/**
 * Everything above the collection list. It lives in the list's `ListHeaderComponent` so the
 * screen scrolls as one surface — a `ScrollView` wrapping the list would nest two scrollers.
 */
export function HomeHeader({
  products,
  isLoading,
  error,
  onOpenProduct,
  onOpenAll,
}: HomeHeaderProps) {
  return (
    <Box gap="s24" paddingBottom="s16">
      <Text variant="displayLarge">Shop</Text>

      <Box gap="s12">
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="titleMedium">Featured</Text>

          <PressableBox
            accessibilityRole="button"
            accessibilityLabel="See all products"
            onPress={onOpenAll}
          >
            <Text variant="caption" color="accent">
              All products
            </Text>
          </PressableBox>
        </Box>

        {products.length === 0 ? (
          <SectionNote isLoading={isLoading} error={error} emptyText="No products published yet." />
        ) : (
          <FlatList
            horizontal
            data={products}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <Box width={CARD_WIDTH}>
                <ProductCard product={item} onPress={onOpenProduct} />
              </Box>
            )}
            contentContainerStyle={ROW_GAP}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </Box>

      <Text variant="titleMedium">Collections</Text>
    </Box>
  );
}

function keyExtractor(product: Product) {
  return product.id;
}

const CARD_WIDTH = 150;
const ROW_GAP = { gap: 8 } as const;
