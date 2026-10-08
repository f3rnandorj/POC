import { FlatList } from "react-native";

import {
  Box,
  CollectionCard,
  ContentBlocks,
  PressableBox,
  screenGutter,
  Text,
} from "@components";
import type { HomeLayout } from "@config";
import type { Collection, Product, ResolvedBlock } from "@domain";

import { HomeProductRow } from "./HomeProductRow";
import { SectionNote } from "./SectionNote";

interface HomeHeaderProps {
  /** The `header` area: story sections this merchant opens the screen with. */
  blocks?: ResolvedBlock[];
  products: Product[];
  title?: string;
  collections: Collection[];
  layout: HomeLayout;
  isLoading: boolean;
  error: unknown;
  onOpenProduct: (handle: string) => void;
  onOpenCollection: (handle: string) => void;
  onOpenAll: () => void;
}

export function HomeHeader({
  blocks,
  products,
  title,
  collections,
  layout,
  isLoading,
  error,
  onOpenProduct,
  onOpenCollection,
  onOpenAll,
}: HomeHeaderProps) {
  return (
    <Box gap="s24" paddingBottom="s16">
      <ContentBlocks blocks={blocks} gap="s24" />

      <Box gap="s12">
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent={title ? "space-between" : "flex-end"}
        >
          {title ? <Text variant="titleMedium">{title}</Text> : null}

          <PressableBox
            accessibilityRole="button"
            accessibilityLabel="See all products"
            onPress={onOpenAll}
          >
            <Text variant="caption" color="accent">
              See all
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
          <HomeProductRow
            products={products}
            layout={layout.mainProductRow}
            onOpenProduct={onOpenProduct}
          />
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

function keyCollection(collection: Collection) {
  return collection.id;
}

const ROW = { ...screenGutter, gap: 8 } as const;
