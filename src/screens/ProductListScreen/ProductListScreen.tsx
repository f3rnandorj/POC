import { FlatList } from "react-native";

import { Box, ProductCard, Screen, screenGutter } from "@components";
import type { Product } from "@domain";
import { useCollectionGetProducts, useProductGetList } from "@domain";
import type { AppScreenProps } from "@routes";

import { ProductListFeedback } from "./components/ProductListFeedback";

export function ProductListScreen({
  route,
  navigation,
}: AppScreenProps<"ProductList">) {
  const collectionHandle = route.params?.collectionHandle;
  // Each hook is disabled in the other's mode, so only the scope in use hits the network.
  const catalog = useProductGetList(!collectionHandle);
  const collection = useCollectionGetProducts(collectionHandle);
  const source = collectionHandle ? collection : catalog;

  function openDetail(handle: string) {
    navigation.navigate("ProductDetail", { handle });
  }

  return (
    <Screen
      eyebrow="Shop"
      title={
        collectionHandle ? collection.title ?? "Collection" : "All products"
      }
      onGoBack={navigation.goBack}
    >
      <FlatList
        data={source.products}
        keyExtractor={keyExtractor}
        numColumns={2}
        renderItem={({ item }) => (
          // `maxWidth` caps the last card of an odd row, which would otherwise span the width.
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
                ? "This collection has no published products."
                : "This store has no published products."
            }
          />
        }
      />
    </Screen>
  );
}

function keyExtractor(product: Product) {
  return product.id;
}

const COLUMN_GAP = { gap: 8 } as const;
const CONTENT = { ...screenGutter, paddingBottom: 32, gap: 8 } as const;
