import { useState } from "react";
import { Image } from "react-native";

import { Box, ContentBlocks, ProductGallery, Screen, Text } from "@components";
import { merchantLayout } from "@config";
import { useProductGetDetail } from "@domain";
import type { AppScreenProps } from "@routes";
import { formatPrice } from "@utils";

import { ProductDetailFeedback } from "./components/ProductDetailFeedback";
import { VariantPicker } from "./components/VariantPicker";

export function ProductDetailScreen({
  route,
  navigation,
}: AppScreenProps<"ProductDetail">) {
  const { product, isLoading, error, refetch } = useProductGetDetail(
    route.params.handle,
  );
  const [selectedId, setSelectedId] = useState<string>();

  if (!product) {
    return (
      <ProductDetailFeedback
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onBack={navigation.goBack}
      />
    );
  }

  const selected = product.variants.find(variant => variant.id === selectedId);
  const preselected =
    selected ?? product.variants.find(variant => variant.isAvailable);
  // `selected`, not `preselected`: the detail must open on the same photo as the grid card
  // that led here. Falls back for a variant whose photo the merchant never set.
  const image = selected?.image ?? product.images[0];
  const { content } = product;

  return (
    // No gutter: the screen opens on a full-bleed photo, so the copy below pads itself.
    <Screen scrollable gutter={false} floatingBack onGoBack={navigation.goBack}>
      {merchantLayout().detail === "gallery" ? (
        <ProductGallery
          images={product.images}
          activeUrl={selected?.image?.url}
          altFallback={product.title}
        />
      ) : (
        <Box backgroundColor="surface" aspectRatio={1} width="100%">
          {image && (
            <Image
              source={{ uri: image.url }}
              accessibilityLabel={image.altText ?? product.title}
              resizeMode="cover"
              style={FILL}
            />
          )}
        </Box>
      )}

      <Box paddingHorizontal="s16" paddingVertical="s24" gap="s12">
        <Text variant="displayLarge">{product.title}</Text>
        <Text variant="priceLarge">{formatPrice(product.price)}</Text>

        <ContentBlocks blocks={content.badgeRow} direction="row" gap="s8" />
        <ContentBlocks blocks={content.underPrice} gap="s4" />
        <ContentBlocks blocks={content.aboveDescription} />

        {product.description.length > 0 && (
          <>
            <Box height={1} backgroundColor="border" marginVertical="s16" />
            <Text variant="body" color="textMuted">
              {product.description}
            </Text>
          </>
        )}

        <ContentBlocks blocks={content.belowDescription} />

        <VariantPicker
          variants={product.variants}
          selectedId={preselected?.id}
          onSelect={setSelectedId}
        />
      </Box>
    </Screen>
  );
}

const FILL = { width: "100%", height: "100%" } as const;
