import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, ProductCard, Text } from '@components';
import type { Product } from '@domain';
import { useProductGetList } from '@domain';
import type { AppScreenProps } from '@routes';

import { ProductListFeedback } from './components/ProductListFeedback';

export function ProductListScreen({ navigation }: AppScreenProps<'ProductList'>) {
  const { top } = useSafeAreaInsets();
  const { products, isLoading, error, refetch } = useProductGetList();

  function openDetail(handle: string) {
    navigation.navigate('ProductDetail', { handle });
  }

  return (
    <Box flex={1} backgroundColor="background" style={{ paddingTop: top }}>
      <Box paddingHorizontal="s16" paddingTop="s24" paddingBottom="s16" gap="s4">
        <Text variant="titleMedium" color="textMuted">
          Shop
        </Text>
        <Text variant="displayLarge">All products</Text>
      </Box>

      <FlatList
        data={products}
        keyExtractor={keyExtractor}
        numColumns={2}
        renderItem={({ item }) => <ProductCard product={item} onPress={openDetail} />}
        columnWrapperStyle={COLUMN_GAP}
        contentContainerStyle={CONTENT}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ProductListFeedback
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
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
