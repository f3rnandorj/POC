import { useState } from "react";

import { Box, ContentBlocks, Screen, Text } from "@components";
import { useProductGetDetail } from "@domain";
import type { AppScreenProps } from "@routes";
import { formatPrice } from "@utils";

import { AddToCartFooter } from "./components/AddToCartFooter";
import { ProductDetailFeedback } from "./components/ProductDetailFeedback";
import { ProductMedia } from "./components/ProductMedia";
import { VariantPicker } from "./components/VariantPicker";

export function ProductDetailScreen({
  route,
  navigation,
}: AppScreenProps<"ProductDetail">) {
  const { product, content, isLoading, error, refetch } = useProductGetDetail(
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

  return (
    // No gutter: the screen opens on a full-bleed photo, so the copy below pads itself.
    <Screen
      scrollable
      gutter={false}
      floatingBack
      onGoBack={navigation.goBack}
      footer={<AddToCartFooter variant={preselected} />}
    >
      {/* `selected`, not `preselected`: the detail must open on the same photo as the grid
          card that led here. */}
      <ProductMedia
        images={product.images}
        activeUrl={selected?.image?.url}
        altFallback={product.title}
      />

      <Box paddingHorizontal="s16" paddingVertical="s24" gap="s12">
        <Text variant="displayLarge">{product.title}</Text>
        <Text variant="priceLarge">{formatPrice(product.price)}</Text>

        <ContentBlocks blocks={content.badgeRow} direction="row" gap="s8" />
        <ContentBlocks blocks={content.textLines} gap="s4" />
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

        <ContentBlocks blocks={content.footer} gap="s24" />
      </Box>
    </Screen>
  );
}
