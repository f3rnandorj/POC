import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, CollectionCard } from '@components';
import type { Collection } from '@domain';
import { useCollectionGetList, useProductGetList } from '@domain';
import type { AppScreenProps } from '@routes';

import { HomeHeader } from './components/HomeHeader';
import { SectionNote } from './components/SectionNote';

export function HomeScreen({ navigation }: AppScreenProps<'Home'>) {
  const { top } = useSafeAreaInsets();
  const { products, isLoading: isLoadingProducts, error: productsError } = useProductGetList();
  const {
    collections,
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useCollectionGetList();

  function openProduct(handle: string) {
    navigation.navigate('ProductDetail', { handle });
  }

  function openCollection(collectionHandle: string) {
    navigation.navigate('ProductList', { collectionHandle });
  }

  return (
    <Box flex={1} backgroundColor="background" style={{ paddingTop: top }}>
      <FlatList
        data={collections}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => (
          <CollectionCard collection={item} onPress={openCollection} />
        )}
        ListHeaderComponent={
          <HomeHeader
            // ponytail: "featured" has no Shopify concept behind it — it is the first N of
            // the catalog. Point it at a `featured` collection handle in merchantConfig the
            // day a merchant curates one.
            products={products.slice(0, FEATURED_COUNT)}
            isLoading={isLoadingProducts}
            error={productsError}
            onOpenProduct={openProduct}
            onOpenAll={() => navigation.navigate('ProductList', {})}
          />
        }
        ListEmptyComponent={
          <SectionNote
            isLoading={isLoadingCollections}
            error={collectionsError}
            emptyText="This store has no published collections."
          />
        }
        contentContainerStyle={CONTENT}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
}

function keyExtractor(collection: Collection) {
  return collection.id;
}

const FEATURED_COUNT = 6;
const CONTENT = { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32, gap: 16 } as const;
