import { useState } from 'react';
import { Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, PressableBox, Text } from '@components';
import { useProductGetDetail } from '@domain';
import type { AppScreenProps } from '@routes';
import { formatPrice } from '@utils';

import { BackControl } from './components/BackControl';
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
  const canAddToCart = Boolean(preselected?.isAvailable) || product.variants.length === 0;
  const [image] = product.images;

  return (
    <Box flex={1} backgroundColor="background" style={{ paddingTop: top }}>
      <BackControl top={top} onPress={navigation.goBack} />

      <ScrollView showsVerticalScrollIndicator={false}>
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

          {/* Badge and metadata slots land in PRD 004. */}

          {product.description.length > 0 && (
            <>
              <Box height={1} backgroundColor="border" marginVertical="s16" />
              <Text variant="body" color="textMuted">
                {product.description}
              </Text>
            </>
          )}

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
