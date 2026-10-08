import { FlatList } from "react-native";

import { Box, ProductCard, screenGutter } from "@components";
import type { HomeLayout } from "@config";
import type { Product } from "@domain";

import { HomeProductCarousel } from "./HomeProductCarousel";

interface HomeProductRowProps {
  products: Product[];
  layout: HomeLayout["mainProductRow"];
  onOpenProduct: (handle: string) => void;
}

export function HomeProductRow({
  products,
  layout,
  onOpenProduct,
}: HomeProductRowProps) {
  switch (layout) {
    case "carousel":
      return (
        <HomeProductCarousel
          products={products}
          autoScroll
          onOpenProduct={onOpenProduct}
        />
      );

    case "double": {
      // Splits the products it already has rather than fetching more; an odd count favors
      // the first row.
      const half = Math.ceil(products.length / 2);

      return (
        <>
          <ScrollRow
            products={products.slice(0, half)}
            onPress={onOpenProduct}
          />
          <ScrollRow products={products.slice(half)} onPress={onOpenProduct} />
        </>
      );
    }

    case "single":
      return <ScrollRow products={products} onPress={onOpenProduct} />;
  }
}

function ScrollRow({
  products,
  onPress,
}: {
  products: Product[];
  onPress: (handle: string) => void;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    // Gutter cancelled on the frame and re-applied as content padding, so the last card
    // scrolls to the real edge instead of stopping a gutter early.
    <Box marginHorizontal="sNegative16">
      <FlatList
        horizontal
        data={products}
        keyExtractor={product => product.id}
        renderItem={({ item }) => (
          <Box width={CARD_WIDTH}>
            <ProductCard product={item} onPress={onPress} />
          </Box>
        )}
        contentContainerStyle={ROW}
        showsHorizontalScrollIndicator={false}
      />
    </Box>
  );
}

const CARD_WIDTH = 150;
const ROW = { ...screenGutter, gap: 8 } as const;
