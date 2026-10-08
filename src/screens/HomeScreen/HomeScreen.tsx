import { FlatList } from "react-native";

import {
  CollectionCard,
  ContentBlocks,
  Screen,
  screenGutter,
} from "@components";
import { homeAreas, homeLayout, homeMainProductRowTitle } from "@config";
import type { Collection } from "@domain";
import {
  useCollectionGetList,
  useMetaobjectGetContent,
  useProductGetList,
} from "@domain";
import type { AppScreenProps } from "@routes";

import { HomeHeader } from "./components/HomeHeader";
import { MerchantSwitch } from "./components/MerchantSwitch";
import { SectionNote } from "./components/SectionNote";

export function HomeScreen({ navigation }: AppScreenProps<"Home">) {
  const {
    products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProductGetList();
  const {
    collections,
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useCollectionGetList();
  // Every home area is metaobject-backed, so one hook resolves the whole screen's content.
  const { content } = useMetaobjectGetContent(homeAreas());
  const layout = homeLayout();

  function openProduct(handle: string) {
    navigation.navigate("ProductDetail", { handle });
  }

  function openCollection(collectionHandle: string) {
    navigation.navigate("ProductList", { collectionHandle });
  }

  return (
    <Screen title="Shop" headerRight={<MerchantSwitch />}>
      <FlatList
        // `horizontal` draws its row inside the header instead — two vertical scrollers fight.
        data={layout.collections === "inline" ? collections : EMPTY}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CollectionCard collection={item} onPress={openCollection} />
        )}
        ListHeaderComponent={
          <HomeHeader
            blocks={content.header}
            // ponytail: the row has no Shopify concept behind it — it is the first N of the
            // catalog, and the merchant names it. Point it at a curated collection handle in
            // merchantConfig the day a merchant curates one.
            products={products.slice(0, LEADING_COUNT)}
            title={homeMainProductRowTitle()}
            collections={collections}
            layout={layout}
            isLoading={isLoadingProducts}
            error={productsError}
            onOpenProduct={openProduct}
            onOpenCollection={openCollection}
            onOpenAll={() => navigation.navigate("ProductList", {})}
          />
        }
        ListEmptyComponent={
          layout.collections === "inline" ? (
            <SectionNote
              isLoading={isLoadingCollections}
              error={collectionsError}
              emptyText="This store has no published collections."
            />
          ) : undefined
        }
        contentContainerStyle={CONTENT}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <ContentBlocks blocks={content.footer} gap="s24" />
        }
      />
    </Screen>
  );
}

const LEADING_COUNT = 6;
const EMPTY: Collection[] = [];
const CONTENT = { ...screenGutter, paddingBottom: 32, gap: 16 } as const;
