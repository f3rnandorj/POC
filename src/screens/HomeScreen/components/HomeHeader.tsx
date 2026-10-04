import { FlatList } from "react-native";

import {
  Box,
  CollectionCard,
  PressableBox,
  ProductCard,
  screenGutter,
  Text,
} from "@components";
import type { MerchantLayout } from "@config";
import type { Collection, Product } from "@domain";

import { SectionNote } from "./SectionNote";

interface HomeHeaderProps {
  products: Product[];
  collections: Collection[];
  layout: MerchantLayout;
  isLoading: boolean;
  error: unknown;
  onOpenProduct: (handle: string) => void;
  onOpenCollection: (handle: string) => void;
  onOpenAll: () => void;
}

export function HomeHeader({
  products,
  collections,
  layout,
  isLoading,
  error,
  onOpenProduct,
  onOpenCollection,
  onOpenAll,
}: HomeHeaderProps) {
  // `double` splits the same products rather than fetching more; an odd count favors row one.
  const rows =
    layout.featured === "double"
      ? [
          products.slice(0, Math.ceil(products.length / 2)),
          products.slice(Math.ceil(products.length / 2)),
        ]
      : [products];

  return (
    <Box gap="s24" paddingBottom="s16">
      <Box gap="s12">
        <Box flexDirection="row" alignItems="center" justifyContent="flex-end">
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
          <SectionNote
            isLoading={isLoading}
            error={error}
            emptyText="No products published yet."
          />
        ) : (
          rows.map((row, index) =>
            row.length === 0 ? null : (
              // Gutter cancelled on the frame and re-applied as content padding, so the last
              // card scrolls to the real edge instead of stopping a gutter early.
              <Box key={index} marginHorizontal="sNegative16">
                <FlatList
                  horizontal
                  data={row}
                  keyExtractor={keyProduct}
                  renderItem={({ item }) => (
                    <Box width={CARD_WIDTH}>
                      <ProductCard product={item} onPress={onOpenProduct} />
                    </Box>
                  )}
                  contentContainerStyle={ROW}
                  showsHorizontalScrollIndicator={false}
                />
              </Box>
            ),
          )
        )}
      </Box>

      <Text variant="titleMedium">Collections</Text>

      {layout.collections === "horizontal" && (
        <Box marginHorizontal="sNegative16">
          <FlatList
            horizontal
            data={collections}
            keyExtractor={keyCollection}
            renderItem={({ item }) => (
              <CollectionCard
                collection={item}
                variant="tile"
                onPress={onOpenCollection}
              />
            )}
            contentContainerStyle={ROW}
            showsHorizontalScrollIndicator={false}
          />
        </Box>
      )}
    </Box>
  );
}

function keyProduct(product: Product) {
  return product.id;
}

function keyCollection(collection: Collection) {
  return collection.id;
}

const CARD_WIDTH = 150;
const ROW = { ...screenGutter, gap: 8 } as const;
