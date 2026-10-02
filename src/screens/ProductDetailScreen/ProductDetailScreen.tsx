import { useState } from 'react';
import { Image, ScrollView } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackControl, Box, ProductBadge, ProductMetadata, ProductSection, Text } from '@components';
import { merchantConfig } from '@config';
import { useProductGetDetail } from '@domain';
import type { AppScreenProps } from '@routes';
import { formatPrice } from '@utils';

import { ProductDetailFeedback } from './components/ProductDetailFeedback';
import { VariantPicker } from './components/VariantPicker';

export function ProductDetailScreen({ route, navigation }: AppScreenProps<'ProductDetail'>) {
  const { top, bottom } = useSafeAreaInsets();
  const { product, isLoading, error, refetch } = useProductGetDetail(route.params.handle);
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
  const preselected = selected ?? product.variants.find(variant => variant.isAvailable);
  // The cover is the product's own photo until the user picks a variant — the
  // preselected chip must not change it, or the detail opens on a different image
  // than the grid card that led here. `image` also falls back for a variant whose
  // photo the merchant never set.
  const image = selected?.image ?? product.images[0];
  // The merchant flag gates the capability, the metafield gates the product. Absent
  // metafield stays `undefined` here, so `ProductBadge` keeps owning the empty case.
  const winterBadge =
    merchantConfig.features.winterCollection && product.metafields.isWinterCollection
      ? merchantConfig.labels.winterCollection
      : undefined;
  // Flag off means the merchant never bought the capability — same as the product not
  // defining it. Resolving it here keeps `ProductSection` owning the empty case.
  const care = merchantConfig.features.productCare
    ? product.metafields.careInstructions
    : undefined;

  return (
    <Box flex={1} backgroundColor="background" style={{ paddingTop: top }}>
      <BackControl top={top} onPress={navigation.goBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
      >
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

        <Box paddingHorizontal="s16" paddingVertical="s24" gap="s12">
          <Text variant="displayLarge">{product.title}</Text>
          <Text variant="priceLarge">{formatPrice(product.price)}</Text>

          {/* The row is conditional for layout only: an empty flex row still consumes one
              of the column's `s12` gaps, which is the hole quick-rule #5 forbids. Each
              badge still owns its own absence. */}
          {product.metafields.badge || winterBadge ? (
            <Box flexDirection="row" flexWrap="wrap" gap="s8">
              <ProductBadge text={product.metafields.badge} />
              <ProductBadge text={winterBadge} />
            </Box>
          ) : null}
          <ProductMetadata
            material={product.metafields.material}
            promotion={product.metafields.promotionText}
          />

          {product.description.length > 0 && (
            <>
              <Box height={1} backgroundColor="border" marginVertical="s16" />
              <Text variant="body" color="textMuted">
                {product.description}
              </Text>
            </>
          )}

          <ProductSection
            title={merchantConfig.labels.productCare}
            items={[
              { label: 'Washing', value: care?.washing },
              { label: 'Drying', value: care?.drying },
            ]}
          />

          <VariantPicker
            variants={product.variants}
            selectedId={preselected?.id}
            onSelect={setSelectedId}
          />
        </Box>
      </ScrollView>
    </Box>
  );
}

const FILL = { width: '100%', height: '100%' } as const;
