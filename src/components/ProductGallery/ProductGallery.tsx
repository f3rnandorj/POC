import { useEffect, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlatList, Image, useWindowDimensions } from "react-native";

import type { ProductImage } from "@domain";
import { motion } from "@theme";

import { AnimatedBox, Box } from "../Box/Box";

interface ProductGalleryProps {
  /** Never empty: `ProductMedia` draws the placeholder for a product with no photo. */
  images: ProductImage[];
  /** The selected variant's photo. Moving it pages the gallery; swiping never moves it back. */
  activeUrl?: string;
  altFallback: string;
}

/** One-way sync on purpose: a swipe must not silently change the selected variant. */
export function ProductGallery({
  images,
  activeUrl,
  altFallback,
}: ProductGalleryProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<ProductImage>>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const index = images.findIndex(image => image.url === activeUrl);

    // A variant whose photo is not among the product's own leaves the gallery where it is,
    // rather than jumping to an unrelated page.
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true });
      setPage(index);
    }
  }, [activeUrl, images]);

  function onSettled(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  return (
    <Box backgroundColor="surface" width="100%">
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={images}
        keyExtractor={image => image.url}
        renderItem={({ item }) => (
          <Box width={width} aspectRatio={1}>
            <Image
              source={{ uri: item.url }}
              accessibilityLabel={item.altText ?? altFallback}
              resizeMode="cover"
              style={FILL}
            />
          </Box>
        )}
        // A single photo is not a gallery: without this it still rubber-bands sideways, which
        // reads as a second image failing to load.
        scrollEnabled={images.length > 1}
        onMomentumScrollEnd={onSettled}
        // The list is laid out before its images resolve, so a scroll can land before the row
        // exists; without this the gallery throws instead of settling on the next frame.
        onScrollToIndexFailed={() => undefined}
        showsHorizontalScrollIndicator={false}
      />

      {images.length > 1 && (
        <Box
          flexDirection="row"
          gap="s4"
          alignSelf="center"
          position="absolute"
          bottom={12}
        >
          {images.map((image, index) => (
            <AnimatedBox
              key={image.url}
              layout={motion.resize}
              width={index === page ? DOT_ACTIVE : DOT}
              height={DOT}
              borderRadius="s2"
              backgroundColor={index === page ? "accent" : "border"}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

const DOT = 6;
const DOT_ACTIVE = 18;
const FILL = { width: "100%", height: "100%" } as const;
