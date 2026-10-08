import { useEffect, useState } from "react";
import { FlatList, Image } from "react-native";

import type { ProductImage } from "@domain";

import { Box } from "../Box/Box";
import { PressableBox } from "../PressableBox/PressableBox";
import { screenGutter } from "../Screen/Screen";

interface ProductFilmstripProps {
  /** Never empty: `ProductMedia` draws the placeholder for a product with no photo. */
  images: ProductImage[];
  /** The selected variant's photo. Picking a variant moves the hero; tapping never moves it back. */
  activeUrl?: string;
  altFallback: string;
}

/**
 * One cover photo you pick, instead of one you swipe: the hero plus a thumbnail strip. Same
 * one-way sync as the gallery — a tap looks around, it never changes the selected variant.
 */
export function ProductFilmstrip({
  images,
  activeUrl,
  altFallback,
}: ProductFilmstripProps) {
  const [heroUrl, setHeroUrl] = useState(images[0].url);

  useEffect(() => {
    // A variant whose photo is not among the product's own leaves the hero where it is,
    // rather than blanking the frame.
    if (activeUrl && images.some(image => image.url === activeUrl)) {
      setHeroUrl(activeUrl);
    }
  }, [activeUrl, images]);

  const hero = images.find(image => image.url === heroUrl) ?? images[0];

  return (
    <Box gap="s8">
      <Box backgroundColor="surface" aspectRatio={1} width="100%">
        <Image
          source={{ uri: hero.url }}
          accessibilityLabel={hero.altText ?? altFallback}
          resizeMode="cover"
          style={FILL}
        />
      </Box>

      {/* A single photo has nothing to pick from, so the strip is the gallery's dots: absent. */}
      {images.length > 1 && (
        <FlatList
          horizontal
          data={images}
          keyExtractor={image => image.url}
          contentContainerStyle={ROW}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <PressableBox
              backgroundColor="surface"
              borderRadius="s4"
              borderWidth={2}
              borderColor={item.url === hero.url ? "accent" : "surface"}
              width={THUMB}
              height={THUMB}
              overflow="hidden"
              accessibilityRole="button"
              accessibilityState={{ selected: item.url === hero.url }}
              accessibilityLabel={item.altText ?? altFallback}
              onPress={() => setHeroUrl(item.url)}
            >
              <Image
                source={{ uri: item.url }}
                resizeMode="cover"
                style={FILL}
              />
            </PressableBox>
          )}
        />
      )}
    </Box>
  );
}

/** Four thumbs plus their gaps fit a 375pt screen inside the gutter. */
const THUMB = 72;
const ROW = { ...screenGutter, gap: 8 } as const;
const FILL = { width: "100%", height: "100%" } as const;
