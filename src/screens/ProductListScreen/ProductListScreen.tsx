import { FlatList } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackControl, Box, ProductCard, Text } from '@components';
import type { Product } from '@domain';
import { useCollectionGetProducts, useProductGetList } from '@domain';
import type { AppScreenProps } from '@routes';

import { ProductListFeedback } from './components/ProductListFeedback';

export function ProductListScreen({ route, navigation }: AppScreenProps<'ProductList'>) {
  const { top } = useSafeAreaInsets();
  const collectionHandle = route.params?.collectionHandle;
  // One screen, two scopes. Each hook is disabled in the other's mode, so the screen never
  // pays for a request it will not render — and never forks into a second list screen.
  const catalog = useProductGetList(!collectionHandle);
  const collection = useCollectionGetProducts(collectionHandle);
  const source = collectionHandle ? collection : catalog;

  function openDetail(handle: string) {
    navigation.navigate('ProductDetail', { handle });
  }

  return (
    <Box flex={1} backgroundColor="background" style={{ paddingTop: top }}>
      {/* Never the stack root now that Home is the entry screen, so the edge-swipe cannot
          be the only way out (ADR 2026-10-01, back control). */}
      <Box paddingTop="s12">
        <BackControl onPress={navigation.goBack} />
      </Box>

      <Box paddingHorizontal="s16" paddingTop="s16" paddingBottom="s16" gap="s4">
        <Text variant="titleMedium" color="textMuted">
          Shop
        </Text>
        <Text variant="displayLarge">
          {collectionHandle ? collection.title ?? 'Collection' : 'All products'}
        </Text>
      </Box>

      <FlatList
        data={source.products}
        keyExtractor={keyExtractor}
        numColumns={2}
        renderItem={({ item }) => (
          // `maxWidth` caps the last card of an odd row. Without it a collection with 1, 3
          // or 5 products stretches its final card across the full width.
          <Box flex={1} maxWidth="50%">
            <ProductCard product={item} onPress={openDetail} />
          </Box>
        )}
        columnWrapperStyle={COLUMN_GAP}
        contentContainerStyle={CONTENT}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ProductListFeedback
            isLoading={source.isLoading}
            error={source.error}
            onRetry={source.refetch}
            emptyText={
              collectionHandle
                ? 'This collection has no published products.'
                : 'This store has no published products.'
            }
          />
        }
      />
    </Box>
  );
}

function keyExtractor(product: Product) {
  return product.id;
}

const COLUMN_GAP = { gap: 8 } as const;
const CONTENT = { paddingHorizontal: 16, paddingBottom: 32, gap: 8 } as const;
