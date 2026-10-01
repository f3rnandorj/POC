import { useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BackControl,
  Box,
  PressableBox,
  ProductBadge,
  ProductMetadata,
  ProductSection,
  Text,
} from '@components';
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
  // The CTA floats over the scroll, so the content has to end above it. Measured rather
  // than guessed — safe area, font scaling and the "Sold out" label all change its height.
  const [footerHeight, setFooterHeight] = useState(0);

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
  const canAddToCart = Boolean(preselected?.isAvailable) || product.variants.length === 0;
  const [image] = product.images;
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
        contentContainerStyle={{ paddingBottom: footerHeight }}
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

          <Box height={1} backgroundColor="border" marginVertical="s16" />

          <VariantPicker
            variants={product.variants}
            selectedId={preselected?.id}
            onSelect={setSelectedId}
          />
        </Box>
      </ScrollView>

      <Box
        paddingHorizontal="s16"
        paddingTop="s12"
        borderTopWidth={1}
        borderTopColor="border"
        style={{ paddingBottom: bottom + 12 }}
        onLayout={event => setFooterHeight(event.nativeEvent.layout.height)}
      >
        {/* ponytail: local feedback only — cart and checkout are out of scope for the POC
            (README "O que NÃO fazer"). Wire a cart service here when one exists. */}
        <PressableBox
          backgroundColor={canAddToCart ? 'accent' : 'surface'}
          borderRadius="s2"
          paddingVertical="s16"
          alignItems="center"
          disabled={!canAddToCart}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canAddToCart }}
          accessibilityLabel={canAddToCart ? 'Add to cart' : 'Sold out'}
          onPress={() => undefined}
        >
          <Text variant="badge" color={canAddToCart ? 'accentText' : 'textMuted'}>
            {canAddToCart ? 'Add to cart' : 'Sold out'}
          </Text>
        </PressableBox>
      </Box>
    </Box>
  );
}

const FILL = { width: '100%', height: '100%' } as const;
